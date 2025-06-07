// Ví dụ: src/modules/dashboard/actions/index.ts
'use server';

import { CourseStatus, OrderStatus } from '@/shared/constants';
import { connectToDatabase } from '@/shared/lib/mongoose';
import {
  CommentModel,
  CourseModel,
  OrderModel,
  RatingModel,
  UserModel,
} from '@/shared/schemas';
import {
  eachDayOfInterval,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';

export async function getDashboardStats() {
  try {
    await connectToDatabase();

    const now = new Date();

    // --- 1. Doanh thu (6 tháng gần nhất so với 6 tháng trước đó) ---
    const sixMonthsAgo = subMonths(now, 6);
    const twelveMonthsAgo = subMonths(now, 12);

    const currentPeriodRevenueResult = await OrderModel.aggregate([
      {
        $match: {
          status: OrderStatus.COMPLETED,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const previousPeriodRevenueResult = await OrderModel.aggregate([
      {
        $match: {
          status: OrderStatus.COMPLETED,
          createdAt: { $gte: twelveMonthsAgo, $lt: sixMonthsAgo },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const currentRevenue = currentPeriodRevenueResult[0]?.total || 0;
    const previousRevenue = previousPeriodRevenueResult[0]?.total || 1;
    const revenueChangePercentage =
      ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // --- 2. Người dùng mới (7 ngày gần nhất so với 7 ngày trước đó) ---
    const sevenDaysAgo = subDays(now, 7);
    const fourteenDaysAgo = subDays(now, 14);
    const totalUsers = await UserModel.countDocuments({});
    const newUsersLast7Days = await UserModel.countDocuments({
      created_at: { $gte: sevenDaysAgo },
    });
    const newUsersPrevious7Days = await UserModel.countDocuments({
      created_at: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
    });
    const userChangePercentage =
      ((newUsersLast7Days - newUsersPrevious7Days) /
        (newUsersPrevious7Days || 1)) *
      100;

    // --- 3. Đơn hàng mới (hôm nay so với hôm qua) & đơn hàng chờ xử lý ---
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const newOrdersToday = await OrderModel.countDocuments({
      createdAt: { $gte: todayStart },
    });
    const newOrdersYesterday = await OrderModel.countDocuments({
      createdAt: { $gte: yesterdayStart, $lt: todayStart },
    });
    const pendingOrdersCount = await OrderModel.countDocuments({
      status: OrderStatus.PENDING,
    });
    const orderChangePercentage =
      ((newOrdersToday - newOrdersYesterday) / (newOrdersYesterday || 1)) * 100;

    // --- 4. Khóa học (hoạt động vs chờ duyệt) & xu hướng (tháng này vs tháng trước) ---
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const activeCoursesCount = await CourseModel.countDocuments({
      status: CourseStatus.APPROVED,
    });
    const pendingCoursesCount = await CourseModel.countDocuments({
      status: CourseStatus.PENDING,
    });
    const newCoursesThisMonth = await CourseModel.countDocuments({
      created_at: { $gte: thisMonthStart },
    });
    const newCoursesLastMonth = await CourseModel.countDocuments({
      created_at: { $gte: lastMonthStart, $lt: thisMonthStart },
    });
    const courseChangePercentage =
      ((newCoursesThisMonth - newCoursesLastMonth) /
        (newCoursesLastMonth || 1)) *
      100;

    const stats = {
      totalRevenue: {
        value: currentRevenue,
        change: revenueChangePercentage,
        description: 'So với 6 tháng trước',
      },
      newUsers: {
        value: newUsersLast7Days,
        total: totalUsers,
        change: userChangePercentage,
        description: 'So với 7 ngày trước',
      },
      newOrders: {
        value: newOrdersToday,
        pendingCount: pendingOrdersCount,
        change: orderChangePercentage,
        description: 'So với hôm qua',
      },
      totalCourses: {
        value: activeCoursesCount,
        pendingCount: pendingCoursesCount,
        change: courseChangePercentage,
        description: 'So với tháng trước',
      },
    };

    return JSON.parse(JSON.stringify(stats)); // Đảm bảo trả về plain object
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    return null; // Trả về null nếu có lỗi
  }
}

export async function getRevenueAndUserStats(timeRangeInDays: number = 30) {
  try {
    await connectToDatabase();
    const endDate = new Date();
    const startDate = subDays(endDate, timeRangeInDays - 1);

    // Lấy dữ liệu đơn hàng đã hoàn thành
    const orders = await OrderModel.find({
      status: OrderStatus.COMPLETED,
      createdAt: { $gte: startOfDay(startDate), $lte: endDate },
    })
      .select('total createdAt')
      .lean();

    // Lấy dữ liệu người dùng mới
    const newUsers = await UserModel.find({
      created_at: { $gte: startOfDay(startDate), $lte: endDate },
    })
      .select('created_at')
      .lean();

    // Tạo mảng tất cả các ngày trong khoảng thời gian
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Xử lý và gộp dữ liệu theo ngày
    const dailyData = allDays.map((day) => {
      const dateString = format(day, 'yyyy-MM-dd');

      const dailyRevenue = orders
        .filter(
          (order) =>
            format(new Date(order.createdAt), 'yyyy-MM-dd') === dateString,
        )
        .reduce((sum, order) => sum + order.total, 0);

      const dailyNewUsers = newUsers.filter(
        (user) =>
          format(new Date(user.created_at), 'yyyy-MM-dd') === dateString,
      ).length;

      return {
        date: dateString,
        revenue: dailyRevenue,
        newUsers: dailyNewUsers,
      };
    });

    return { success: true, data: JSON.parse(JSON.stringify(dailyData)) };
  } catch (error: any) {
    console.error('Lỗi khi lấy thống kê doanh thu và người dùng:', error);
    return { success: false, error: error.message };
  }
}

// 2. Action lấy thống kê trạng thái khóa học
export async function getCourseStatusStats() {
  try {
    await connectToDatabase();
    // Dùng aggregate để nhóm và đếm theo trạng thái
    const stats = await CourseModel.aggregate([
      {
        $group: {
          _id: '$status', // Nhóm theo trường 'status'
          count: { $sum: 1 }, // Đếm số lượng document trong mỗi nhóm
        },
      },
    ]);

    // Format lại dữ liệu cho biểu đồ tròn
    const formattedStats = stats.map((item) => ({
      status: item._id, // Ví dụ: 'APPROVED', 'PENDING'
      count: item.count,
    }));

    return { success: true, data: JSON.parse(JSON.stringify(formattedStats)) };
  } catch (error: any) {
    console.error('Lỗi khi lấy thống kê khóa học:', error);
    return { success: false, error: error.message };
  }
}
export async function getPendingCourses(limit: number = 5) {
  try {
    await connectToDatabase();
    const courses = await CourseModel.find({ status: CourseStatus.PENDING })
      .sort({ createdAt: -1 }) // Lấy các khóa học mới nhất
      .limit(limit)
      .populate({ path: 'author', select: 'name' }) // Lấy tên giảng viên
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(courses)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Lấy các đơn hàng đang chờ xác nhận
export async function getPendingOrders(limit: number = 5) {
  try {
    await connectToDatabase();
    const orders = await OrderModel.find({ status: OrderStatus.PENDING })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: 'user', select: 'name' }) // Lấy tên người dùng
      .populate({ path: 'course', select: 'title' }) // Lấy tên khóa học
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. Lấy các bình luận/đánh giá chờ kiểm duyệt
// Giả định CommentModel và RatingModel của bạn có trường `moderationStatus: 'PENDING'`
// hoặc một trường tương tự như `isApproved: false`
export async function getPendingReviews(limit: number = 5) {
  try {
    await connectToDatabase();
    // Ví dụ lấy bình luận
    const comments = await CommentModel.find({ moderationStatus: 'PENDING' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: 'user', select: 'name' })
      .populate({ path: 'course', select: 'title' })
      .lean();
    // Bạn có thể làm tương tự cho RatingModel và gộp kết quả lại nếu muốn
    return { success: true, data: JSON.parse(JSON.stringify(comments)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function getTopSellingCourses(limit: number = 5) {
  try {
    await connectToDatabase();

    const thisMonthStart = startOfMonth(new Date());

    const topCourses = await OrderModel.aggregate([
      // Lọc các đơn hàng đã hoàn thành trong tháng này
      {
        $match: {
          status: OrderStatus.COMPLETED,
          createdAt: { $gte: thisMonthStart },
        },
      },
      // Đếm số lần xuất hiện của mỗi course
      {
        $group: {
          _id: '$course', // Nhóm theo course ID
          salesCount: { $sum: 1 }, // Đếm số đơn hàng
        },
      },
      // Sắp xếp theo số lượng bán giảm dần
      { $sort: { salesCount: -1 } },
      // Giới hạn lấy 5 kết quả
      { $limit: limit },
      // Kết nối (join) với collection 'courses' để lấy thông tin chi tiết
      {
        $lookup: {
          from: 'courses', // Tên collection của CourseModel
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails',
        },
      },
      // "Mở" mảng courseDetails
      { $unwind: '$courseDetails' },
      // Chọn các trường cần thiết để trả về
      {
        $project: {
          title: '$courseDetails.title',
          slug: '$courseDetails.slug',
          salesCount: '$salesCount',
          _id: 0,
        },
      },
    ]);

    return { success: true, data: topCourses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Action lấy Top 5 khóa học được đánh giá cao nhất
export async function getTopRatedCourses(limit: number = 5) {
  try {
    await connectToDatabase();
    // Logic này giả định RatingModel có trường 'course' (ObjectId) và 'rating' (Number)
    const topCourses = await RatingModel.aggregate([
      // Nhóm theo course ID và tính điểm trung bình, đếm số lượt đánh giá
      {
        $group: {
          _id: '$course',
          averageRating: { $avg: '$rate' },
          ratingCount: { $sum: 1 },
        },
      },
      // Chỉ lấy những khóa học có ít nhất ví dụ 3 đánh giá để kết quả khách quan hơn
      { $match: { ratingCount: { $gte: 3 } } },
      // Sắp xếp theo điểm trung bình giảm dần, sau đó theo số lượng đánh giá giảm dần
      { $sort: { averageRating: -1, ratingCount: -1 } },
      // Giới hạn 5 kết quả
      { $limit: limit },
      // Kết nối với collection 'courses'
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails',
        },
      },
      { $unwind: '$courseDetails' },
      // Chọn các trường cần thiết
      {
        $project: {
          title: '$courseDetails.title',
          slug: '$courseDetails.slug',
          averageRating: '$averageRating',
          ratingCount: '$ratingCount',
          _id: 0,
        },
      },
    ]);

    return { success: true, data: topCourses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
