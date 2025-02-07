type TActiveLinkProps = {
	url: string;
	children: React.ReactNode;
};

type TMenuItem = {
	url: string;
	title: string;
	icon?: React.ReactNode;
};

// User
type TCreateUserParams = {
	clerkId: string;
	username: string;
	email_address: string;
	name?: string;
	avatar?: string;
};
export { ActiveLinkProps, TCreateUserParams, TMenuItem };

//  Khi code ko có dạng d.ts - viết những type - khi built ra production - nó sẽ built tất cả code cta thành typescript - bởi vì typescript sẽ ko chạy đc trong môi trg trình duyệt - sẽ convert sang js - thì những type sẽ convert - nhưng cta ko muốn - bởi vì những type convert qa ko có tác dụng
// Bời vậy khi dùng d.ts -> chỉ có mục đích là share thôi - trong môi trg development - khi cta built sẽ ko dịch sang js
