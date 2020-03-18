// tslint:disable no-implicit-dependencies
import { Context, CustomAuthorizerEvent } from "aws-lambda";
import { skipValueObject, verifyFirebaseToken, StatusCode, User } from "../common";
import { initDBConnection } from "../common/services";
import { generateAllow } from "./policy";

export async function authorize(event: CustomAuthorizerEvent, context: Context) {
  try {
    const token = event.authorizationToken;
    const authId = await verifyFirebaseToken(token);

    if (!authId) {
      const message = "Invalid token";
      console.warn(message);

      return context.fail("Unauthorized");
    }

    await initDBConnection();
    const user = await User.findOne({ authId });

    if (!user) {
      const message = `Can not find user with firebase ID: ${authId}`;

      console.warn(message);

      return context.fail("Unauthorized");
    }

    if (user.status !== StatusCode.Active) {
      const message = `User is ${user.status}`;
      console.warn(message);

      return context.fail("Unauthorized");
    }

    const model = skipValueObject(user.toJSON());
    Object.keys(model).forEach((e) => {
      if (e === "_id") {
        model[e] = model[e];
      } else if (Array.isArray(model[e])) {
        model[e] = model[e].join(",");
      } else if (typeof model[e] === "object") {
        model[e] = JSON.stringify(model[e]);
      }
    });
    const response = {
      ...generateAllow(
        context.awsRequestId,
        event.methodArn
      ),
      context: model
    };
    console.log("User authorized", model);

    return context.succeed(response);
  } catch (e) {
    console.log("Exception authorizer", e);

    return context.fail("Unauthorized");
  }
}

export async function authorization(event: CustomAuthorizerEvent, context: Context) {
  try {
    const token = event.authorizationToken;
    const authId = await verifyFirebaseToken(token);

    if (!authId) {
      const message = "Invalid token";
      console.warn(message);

      return context.fail("Unauthorized");
    }

    const response = {
      ...generateAllow(
        context.awsRequestId,
        event.methodArn
      ),
      context: { authId }
    };
    console.log("User authorized", authId);

    return context.succeed(response);
  } catch (e) {
    console.log("Exception authorizer", e);

    return context.fail("Unauthorized");
  }
}
