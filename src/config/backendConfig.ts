import ThirdPartyEmailPasswordNode from "supertokens-node/recipe/thirdpartyemailpassword";
import SessionNode from "supertokens-node/recipe/session";
import { appInfo } from "./appInfo";
import { TypeInput } from "supertokens-node/types";

export const connectionURI =
  process.env.SUPERTOKENS_URL || `https://try.supertokens.io`;

export const apiKey = process.env.SUPERTOKENS_KEY || ``;

export const backendConfig = (): TypeInput => {
  return {
    framework: "express",
    supertokens: {
      connectionURI,
      apiKey,
    },
    appInfo,
    recipeList: [
      ThirdPartyEmailPasswordNode.init({
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,

              // we override the thirdparty sign in / up API
              thirdPartySignInUpPOST: async function (input) {
                if (
                  originalImplementation.thirdPartySignInUpPOST === undefined
                ) {
                  throw Error("Should never come here");
                }

                let response =
                  await originalImplementation.thirdPartySignInUpPOST(input);

                // if sign in / up was successful...
                if (response.status === "OK") {
                  // In this example we are using Google as our provider
                  let accessToken = response.authCodeResponse.access_token;
                }

                return response;
              },
            };
          },
        },
        providers: [
          ThirdPartyEmailPasswordNode.Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            scope: ["https://www.googleapis.com/auth/userinfo.profile"],
          }),
        ],
      }),
      SessionNode.init({
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              createNewSession: async function (input) {
                let userId = input.userId;

                let role = "admin"; // TODO: fetch role based on userId

                input.accessTokenPayload = {
                  ...input.accessTokenPayload,
                  role,
                };

                return originalImplementation.createNewSession(input);
              },
            };
          },
        },
      }),
    ],
    isInServerlessEnv: true,
  };
};
