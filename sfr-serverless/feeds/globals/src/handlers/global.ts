import Axios from "axios";
import * as cheerio from "cheerio";
import { Response, Router } from "express";
import {
  responseError, validateBody, Gender,
  IRequest, Role, StatusCode, User
} from "../../../common";
import { listCountries } from "../../../common/models/countries";
import { ListProfession } from "../../../common/models/profession";
import { Setting } from "../models";
import { InsertSettingSchema } from "../schemas";

function globalRouter(route: Router) {

  route.route("/settings")
    .get(getSettings)
    .post(validateBody(InsertSettingSchema), create);
  route.get("/users", getInformationUser);
  route.get("/urlcontent", getUrlContent);
  // route.post("/zombie", createZ);
  route.get("/configurations", getCfg);

}

// async function createZ(req: IRequest, res: Response) {
//   try {
//     const user = await createFirebaseUser(req.body);

//     return res.json(user.uid);
//   } catch (error) {
//     return responseError(req, res, error);
//   }
// }

async function getCfg(req: IRequest, res: Response) {
  try {
    const accessKey = "AKIAJQLZJA7JYVNGOBPA";
    const secretKey = "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";

    return res.json({
      cfg: {
        ak: accessKey,
        sk: secretKey
      }
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getSettings(req: IRequest, res: Response) {
  try {

    const settings = await Setting.find();
    const result: any = {};
    settings.forEach((e) => {
      result[e.key] = e.value;
    });
    const baseUrl = process.env.LINK_USER_WEB;
    // const KEY = "soundfyr-aws-to-connects";
    // const accessKey = "AKIAJQLZJA7JYVNGOBPA";
    // const secretKey = "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";

    return res.json({
      gender: [Gender.Female, Gender.Male].sort((a, b) => a < b ? -1 : 1),
      role: [Role.Fan, Role.Musician].sort((a, b) => a < b ? -1 : 1),
      profession: ListProfession.sort((a, b) => a < b ? -1 : 1),
      // cfg: {
      //   ak: encodeCipher(accessKey, KEY),
      //   sk: encodeCipher(secretKey, KEY)
      // },
      privacyPolicy: baseUrl + "/privacypolicy/",
      termsOfConditions: baseUrl + "/termsofconditions/",
      termsOfUses: baseUrl + "/termsofuse/",
      codeOfConduct: baseUrl + "/codeofconduct/",
      countries: listCountries.sort((a, b) => a.countryName < b.countryName ? -1 : 1).map(
        (e) => ({
          phoneCode: "+" + e.phoneCode,
          countryName: e.countryName
        })
      ),
      ...result
    });
  } catch (error) {
    return responseError(req, res, error);
  }

}

async function create(req: IRequest, res: Response) {
  try {

    const form = req.body;
    const model = await Setting.create(form);

    return res.json(model);
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getInformationUser(req: IRequest, res: Response) {
  try {

    const username = req.query.username;
    if (!username) {
      return res.json({
        email: null,
        username: null
      });
    }
    const user = await User.findOne({
      username,
      status: StatusCode.Active
    });
    if (!user) {
      return res.json({
        email: null,
        username: null
      });
    }

    return res.json({
      email: user.email,
      username: user.username
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getUrlContent(req: IRequest, res: Response) {
  try {
    const { url: urlRequest } = req.query;

    return Axios.get(urlRequest).then((response) => {
      const link =
        `${response.request.res.req.agent.protocol}//${response.request.res.connection._host}${response.request.path}`;
      const $ = cheerio.load(response.data);
      const getMetaData = (arrPattern) => {
        let result;
        arrPattern.every((e) => {
          result = typeof e === "string" ? $(e).text() : $(e.path).attr(e.attr);

          return result ? false : true;
        });

        return result;
      };
      const getImage = () => {
        const imageList = [];
        $("img").each((_i, e) => {
          const url = $(e).attr("src");
          if (url ?
            !/\.gif|\.svg/g.test(/(?:.(?!\.))+$/g.exec(url)[0]) ? url : null
            : null) {
            imageList.push(url);
          }
        });

        return imageList && imageList.length > 0 ? imageList[0] : getMetaData([
          { path: `head link[rel="icon"]`, attr: "href" },
          { path: `head link[type="image/png"]`, attr: "href" }
        ]);
      };
      const parseThumbnailUrl = (url) => {
        if (!/http/g.test(url)) {
          if (!/^\//.test(url)) {
            url = "/" + url;
          }
          url = link.replace(/\/$/g, "") + url;
        }
        const regex = /\.([0-9a-z]+)(?:[\?#]|$)/g.exec(url);
        const fileExtension = regex && regex.length > 0 ? regex[0] : "";

        return /\.jpg|\.jpge|\.png|\.ico/g.test(fileExtension) ? url : null;
      };

      const metaData = {
        link: link || urlRequest,
        title: getMetaData([
          "head title",
          { path: `head meta[name="title"]`, attr: "content" },
          { path: `head meta[property="og:title"]`, attr: "content" },
        ]),
        description: getMetaData([
          { path: `head meta[name="description"]`, attr: "content" },
          { path: `head meta[property="og:description"]`, attr: "content" },
        ]),
        thumbnailUrl: parseThumbnailUrl(parseThumbnailUrl(getMetaData([
          { path: `head meta[property="og:image"]`, attr: "content" },
          { path: `head meta[itemprop="image"]`, attr: "content" }
        ])) || getImage()) || ""
      };

      return res.json(metaData);
    }).catch((error) => {
      return responseError(req, res, error);
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

export { globalRouter };
