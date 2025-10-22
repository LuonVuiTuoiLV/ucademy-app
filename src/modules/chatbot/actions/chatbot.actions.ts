// app/actions/chatActions.ts
'use server';

import {
  Content,
  GenerationConfig,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { FilterQuery } from 'mongoose';

import { CourseStatus, UserRole } from '@/shared/constants';
import { connectToDatabase } from '@/shared/lib/mongoose';
import {
  CourseModel, // Thêm nếu bạn muốn chatbot truy vấn đơn hàng
  UserModel,
} from '@/shared/schemas';

// --- Cấu hình Gemini ---
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generationConfig: GenerationConfig = {
  temperature: 0.5, // Giảm để câu trả lời tập trung, ít bịa đặt
  topK: 30,
  topP: 0.9,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-latest',
  generationConfig,
  safetySettings,
});

// --- Kiểu dữ liệu ---
interface ChatResponse {
  success: boolean;
  message?: string;
  answer?: string;
  debugInfo?: {
    intent?: string;
    entities?: Record<string, any>;
    dbQueryInfo?: {
      queryRan?: string | null;
      dataSummary?: string;
    };
    finalUserMessageToLLM?: string; // Chỉ câu hỏi user + context
    rawLLMResponse?: string;
  };
}

interface QueryAnalysis {
  intent: string;
  entities: Record<string, any>;
  requiresContextFromDB: boolean;
}

// --- Bước 1: Phân tích câu hỏi của người dùng ---
async function analyzeUserQuery(userQuery: string): Promise<QueryAnalysis> {
  const analysisSystemInstruction = `Bạn là một AI phân tích câu hỏi người dùng cho Ucademy, một nền tảng học trực tuyến.
Nhiệm vụ của bạn là xác định ý định (intent) và các thực thể (entities) từ câu hỏi bằng tiếng Việt.
Trả về kết quả dưới dạng một đối tượng JSON hợp lệ với các khóa: "intent" (string), "entities" (object), và "requiresContextFromDB" (boolean).

Các intent có thể có và các entities thường đi kèm:
1.  "FIND_COURSES": Tìm kiếm khóa học. requiresContextFromDB: true.
    - Entities: "keyword" (từ khóa), "level" (beginner, intermediate, advanced), "author_name", "category".
2.  "GET_COURSE_DETAILS": Lấy thông tin chi tiết một khóa học. requiresContextFromDB: true.
    - Entities: "course_slug" (ưu tiên) hoặc "course_title".
3.  "COUNT_ITEMS": Đếm số lượng. requiresContextFromDB: true.
    - Entities: "item_type" (courses, users), "status", "level", "role".
4.  "GENERAL_GREETING": Lời chào. requiresContextFromDB: false.
5.  "GENERAL_THANKS": Cảm ơn. requiresContextFromDB: false.
6.  "GENERAL_QUERY_ABOUT_UCADEMY": Câu hỏi chung về Ucademy. requiresContextFromDB: false.
7.  "UNKNOWN_OR_COMPLEX_QUERY": Câu hỏi không rõ ràng hoặc ngoài phạm vi. requiresContextFromDB: false.

Ví dụ phân tích:
Câu hỏi: "Tìm các khóa học NextJS cơ bản"
JSON: {"intent": "FIND_COURSES", "entities": {"keyword": "NextJS", "level": "beginner"}, "requiresContextFromDB": true}
Câu hỏi: "Ucademy có những chính sách nào?"
JSON: {"intent": "GENERAL_QUERY_ABOUT_UCADEMY", "entities": {}, "requiresContextFromDB": false}
Câu hỏi: "cảm ơn bot"
JSON: {"intent": "GENERAL_THANKS", "entities": {}, "requiresContextFromDB": false}

Câu hỏi của người dùng: "${userQuery}"
Phân tích JSON:
  `;

  try {
    const result = await geminiModel.generateContent(analysisSystemInstruction);
    const responseText = result.response.text();
    const cleanedResponseText = responseText
      .replaceAll(/^```json\s*|```\s*$/g, '')
      .trim();
    const analysis = JSON.parse(cleanedResponseText);

    return {
      intent: analysis.intent || 'UNKNOWN_OR_COMPLEX_QUERY',
      entities: analysis.entities || {},
      requiresContextFromDB: analysis.requiresContextFromDB === true,
    };
  } catch (error) {
    return {
      intent: 'UNKNOWN_OR_COMPLEX_QUERY',
      entities: {},
      requiresContextFromDB: false,
    };
  }
}

// --- Bước 2: Lấy dữ liệu từ Mongoose ---
async function fetchDataFromDatabase(
  intent: string,
  entities: Record<string, any>,
): Promise<{ data: any; queryRan: string | null }> {
  await connectToDatabase();
  let data: any = null;
  let queryRan: string | null =
    `No DB query pre-defined for intent: ${intent} with entities: ${JSON.stringify(entities)}`;

  try {
    switch (intent) {
      case 'FIND_COURSES': {
        const mongoQuery: FilterQuery<typeof CourseModel> = {
          status: CourseStatus.APPROVED,
        };

        if (entities.keyword)
          mongoQuery.title = { $regex: new RegExp(entities.keyword, 'i') };
        if (entities.level) mongoQuery.level = entities.level.toLowerCase();
        data = await CourseModel.find(mongoQuery)
          .sort({ views: -1, created_at: -1 })
          .limit(entities.limit || 3)
          .select('title slug level price') // Lấy ít trường hơn cho danh sách
          .lean();
        queryRan = `CourseModel.find(${JSON.stringify(mongoQuery)}) limited to 3`;
        break;
      }
      case 'GET_COURSE_DETAILS': {
        const mongoQuery: FilterQuery<typeof CourseModel> = {
          status: CourseStatus.APPROVED,
        };

        if (entities.course_slug) mongoQuery.slug = entities.course_slug;
        else if (entities.course_title)
          mongoQuery.title = { $regex: new RegExp(entities.course_title, 'i') };
        else break;
        data = await CourseModel.findOne(mongoQuery)
          .populate('author', 'name') // Lấy tên tác giả
          .select(
            'title slug desc price views level info.benefits author lectures_count total_duration',
          ) // Các trường quan trọng
          .lean();
        queryRan = `CourseModel.findOne(${JSON.stringify(mongoQuery)})`;
        break;
      }
      case 'COUNT_ITEMS': {
        let count = 0;
        let modelName = 'UnknownModel';
        const countQuery: FilterQuery<any> = {};

        if (entities.item_type === 'courses') {
          modelName = 'CourseModel';
          if (entities.status) countQuery.status = entities.status;
          if (entities.level) countQuery.level = entities.level.toLowerCase();
          count = await CourseModel.countDocuments(countQuery);
        } else if (entities.item_type === 'users') {
          modelName = 'UserModel';
          if (entities.role)
            countQuery.role = entities.role.toUpperCase() as UserRole;
          count = await UserModel.countDocuments(countQuery);
        }
        data = { type: entities.item_type, count };
        queryRan = `${modelName}.countDocuments(${JSON.stringify(countQuery)})`;
        break;
      }
      // Thêm các case khác tại đây
    }
  } catch (databaseError) {
    queryRan = `DB Error during intent: ${intent}`;
    data = null;
  }

  return { data, queryRan };
}

// ---- Bước 3: Server Action Chính ----
export async function askChatbot(
  userQuery: string,
  conversationHistory: Content[] = [],
): Promise<ChatResponse> {
  if (!userQuery.trim()) {
    return { success: false, message: 'Vui lòng nhập câu hỏi.' };
  }

  const debugInfo: ChatResponse['debugInfo'] = {};

  try {
    const analysis = await analyzeUserQuery(userQuery);

    debugInfo.intent = analysis.intent;
    debugInfo.entities = analysis.entities;

    let databaseData = null;

    if (analysis.requiresContextFromDB) {
      const { data: databaseDataResult, queryRan } =
        await fetchDataFromDatabase(analysis.intent, analysis.entities);

      databaseData = databaseDataResult;
      debugInfo.dbQueryInfo = {
        queryRan,
        dataSummary: databaseData
          ? Array.isArray(databaseData)
            ? `${databaseData.length} kết quả`
            : '1 đối tượng / đếm'
          : 'Không có dữ liệu từ DB',
      };
    }

    const systemInstructionText = `Bạn là Ucademy Bot, trợ lý AI của nền tảng học trực tuyến Ucademy.
    Luôn trả lời bằng tiếng Việt, một cách thân thiện, chuyên nghiệp và chính xác.
    Nhiệm vụ chính của bạn là TRẢ LỜI câu hỏi của người dùng. TUYỆT ĐỐI KHÔNG lặp lại câu hỏi của người dùng.
    Nếu "Thông tin ngữ cảnh từ Ucademy" được cung cấp, hãy ƯU TIÊN sử dụng nó để trả lời.
    Nếu thông tin không đủ hoặc không liên quan, trả lời dựa trên kiến thức chung về Ucademy hoặc yêu cầu người dùng làm rõ.
    Nếu không biết, hãy nói rõ. Không bịa đặt.
    Khi liệt kê danh sách, nếu có nhiều kết quả, chỉ nêu tối đa 3-4 mục và gợi ý người dùng tìm kiếm chi tiết hơn.
    Nếu người dùng chào, chào lại ngắn gọn và hỏi xem bạn có thể giúp gì về Ucademy.
    `;

    let contextualPromptForUserMessage = '';

    if (analysis.requiresContextFromDB) {
      const dataIsEmptyOrNull =
        !databaseData ||
        (Array.isArray(databaseData) && databaseData.length === 0) ||
        (typeof databaseData === 'object' &&
          Object.keys(databaseData).length === 0 &&
          analysis.intent !== 'COUNT_ITEMS') ||
        (typeof databaseData === 'object' &&
          databaseData.count === 0 &&
          analysis.intent === 'COUNT_ITEMS');

      contextualPromptForUserMessage = dataIsEmptyOrNull
        ? `\n\n[LƯU Ý CHO BOT: Tôi đã tìm trong cơ sở dữ liệu Ucademy cho truy vấn "${userQuery}" (phân tích là intent: ${analysis.intent}, entities: ${JSON.stringify(analysis.entities)}) nhưng không tìm thấy kết quả nào. Hãy thông báo điều này cho người dùng và gợi ý họ thử lại hoặc cung cấp thêm chi tiết. Đừng chỉ nói "Không có dữ liệu".]`
        : `\n\n[Thông tin ngữ cảnh từ Ucademy để bạn tham khảo khi trả lời câu hỏi "${userQuery}":\n${JSON.stringify(databaseData, null, 2)}\nSử dụng thông tin này để trả lời một cách cụ thể và chính xác nhất. Tóm tắt nếu dữ liệu dài.]`;
    }

    const userMessageForLLM = userQuery + contextualPromptForUserMessage;

    debugInfo.finalUserMessageToLLM = userMessageForLLM; // Chỉ phần user và context, system prompt xử lý riêng

    // Xây dựng lịch sử để đưa vào chat, loại bỏ tin nhắn cuối cùng của user nếu nó giống userMessageForLLM (tránh lặp)
    const historyForChatAPI: Content[] = [...conversationHistory];

    const chat = geminiModel.startChat({
      safetySettings,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstructionText }],
      },
    });

    const result = await chat.sendMessage(userMessageForLLM);
    const response = result.response;
    const responseText = response.text();

    debugInfo.rawLLMResponse = responseText;

    if (response.promptFeedback?.blockReason) {
      return {
        success: false,
        message: `Câu trả lời bị chặn do chính sách an toàn: ${response.promptFeedback.blockReason}.`,
        debugInfo,
      };
    }

    return {
      success: true,
      answer: responseText,
      debugInfo,
    };
  } catch (error: any) {
    let errorMessage = 'Đã có lỗi xảy ra khi xử lý yêu cầu của bạn.';

    if (error.message?.includes('JSON.parse')) {
      errorMessage = 'Lỗi xử lý định dạng dữ liệu từ AI. Vui lòng thử lại.';
    } else if (error.message?.includes('candidate')) {
      errorMessage =
        'Xin lỗi, tôi không thể tạo câu trả lời vào lúc này. Vui lòng thử lại sau giây lát.';
    } else if (error.message?.includes('SAFETY')) {
      errorMessage =
        'Yêu cầu của bạn có thể vi phạm chính sách an toàn. Vui lòng thử lại.';
    }
    debugInfo.rawLLMResponse = `Error: ${error.message || 'Unknown error'}`;

    return { success: false, message: errorMessage, debugInfo };
  }
}
