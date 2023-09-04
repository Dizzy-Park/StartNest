class AbsWP {
  id: number;
  slug: string;
}

export class WPItem extends AbsWP {
  name: string;
}

export class WPPost extends AbsWP {
  title: string;
}

export class WPMedia extends AbsWP {
  deleted?: any;
  source_url: string;
}

export class WPPaging {
  total: number;
  totalPages: number;
  links: { [key: string]: string };
}

export class WPCategoryList extends Array<WPItem> {
  _paging: WPPaging;
}

export class WPUserList extends Array<WPItem> {
  _paging: WPPaging;
}

export class WPTags extends Array<WPItem> {
  _paging: WPPaging;
}

export class WPMediaList extends Array<WPMedia> {
  _paging: WPPaging;
}

export class WPPostList extends Array<WPPost> {
  _paging: WPPaging;
}

export class WPCreateContentDto {
  title: string;
  categories: Array<number>;
  date: Date;
  content: string;
  status: string = 'pending';
  author: number;
  slug: string;
  tags: Array<number>;
  featured_media: number;
  post_meta: [{ key: string; value: number }];
}
