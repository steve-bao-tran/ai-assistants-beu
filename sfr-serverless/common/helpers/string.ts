export function slugString(slug: string, delimiter: string = "-") {
  slug = slug
    .replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, (x) => {
      return x.replace(x, delimiter);
    })
    .replace(/ /g, (x) => {
      return x.replace(x, delimiter);
    })
    .toLowerCase();

  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a");
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e");
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, "i");
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o");
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u");
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y");
  slug = slug.replace(/đ/gi, "d");

  slug = slug
    .replace(/-{2,}/g, (x) => {
      return x.replace(x, delimiter);
    })
    .replace(/^-{1,}/g, "")
    .replace(/-{1,}$/g, "")
    .replace(/-{2,}/g, delimiter);

  return slug;
}

export interface IOptionGenerateText {
  length?: number;
}

export function generateText(options: IOptionGenerateText) {
  const length = options ? options.length : 5;
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
