import * as firebase from "firebase";

process.env.TEST_MODE = process.env.TEST_MODE || "local";
process.env.ONE_SIGNAL_APP_ID = "b51a6622-2ca6-417f-9715-1b471f3a5b3a";
process.env.ONE_SIGNAL_API_KEY = "NzUzNjdhOTAtZDE5Mi00NWM3LTkyOWUtM2I5NDlhOGE0MDFh";

// config local
/* tslint:disable */
process.env.FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-p9o4w@soundfyr-dev-f1081.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCYxSRO9Rw0lxOH\ncuZzS3vOX212guFGPULT9RvgXWYZVSc8IUIcqx9OQONTaDEgwZZ+RzacUuwhV447\n+BA70sHg7oTTDweHJacFDsPROhAmY7b+/D70++zPOuDhd01zPj4b1juBHZQbOYQG\n7W+KsLdKUgEoUuMSyBPx156M57FGLYGSG3HGJOnNsqXNNsswOY3S+EHN7mF6YCn9\nTOUfOpTkATvQsDc0EabPnNz2iuraF1M7RahRu28NjNcw4CJHyicZYHyHqF5ZEqdp\n1+9iyxZgJL9Nuyo7omTuJrQ8DDxBzg7u+3fkDfPPZKymNt/E2r8c6/QqXo1QlaDJ\nwGpFfeofAgMBAAECggEAFn/SXR6UTNqDMcumTQys6zP6tx2HeATFttm+hUi8JLb5\n1E1Bo19AeRHtaPdLZPud4nMyg8tio3Z1qDdcjLL5gtseDMeF4E2XT5NhG4tlnYHK\nDbuwufvwYITXYd1kNrjQBOGEWfu1OF08KJkHeHGWTQfOy9WJQ9bbuR58Z1woK6GF\nwII9A3/V7BjORucAFAOBUEUJBWN+8hSA0z/S6xfuUrUQ2wcJmCK+qYo5h0IQnkxC\nf8Ub+jl//nk2gRF2t6wGBcLPGtS3mHqlzh0DYPNYR2i9yruYqcCyPCOR+OU70V+i\nDnmzVvNEpiOsAD4wp40yGrmkl06Hb520lKG7ARQ2IQKBgQDRAmOPHgjrRTGadxEU\nS4LgEQCjyjkMm75VNGqM09crc3HNt4nt6tBEsI75xQ6nw3fFYUm8yOGKdB864FkL\nbGPdE/wT2cGGaVnWNURIbjTARc4OGlNDLNuv6WhHqiFyOM8WDpt/W0C+f0qgHGhI\nT9km8shELWA9dfJ5+iiwRrgalQKBgQC7HeHAV8ZySAisSSuTl0cI5Y1HYQ46Tgsa\nfmPujKpZj9+lsB8ONv+jXD7tO5MuZAwQqYKp4ZxoJ3QOaLevYx/nu4e27oQ4PHkZ\n9tzQ6m+vrXYQRe9l6HDhBkmPkWhiGhdjcWi6dAtjiBwdMm9nPr6AFXVKU7GkCMHO\nliK3ewb44wKBgFgKX5GrnyorbWeZfBJGdIyZ3OEhj8Jl4FjXyYIkweBFssxq4ajc\nXnpwvOktPq0gQ1VbU8o3+/lsTLNqSVfsgmxfvLFH6qMJwZPfwDGaapILVW7PW/9R\n6ABDm2+ElK4ei+zInmuZLr6PtAmZrbu4Fsq3PfCqBH4fLtJ+s6D9SRO5AoGBALOQ\nnZAjq8EH96q+HR9p0TVsdQPG1AyH0IgAOo42V1PTieBK/8J4bSKr54dp4Hhoclub\nEFVOuPYKxoj9XSjmizuq7zZR9nixL9YG3SlvkPaaE+7R7kdxpMGNcxJfjDh4qXE4\n6DPmIPfHKpOqTtZZlB7+eKx3XMX50WMbGP3TBoHZAoGAVyrerzxxV/dEDebnQkpT\n0NXWk+2Yh/5cCdVh8HGu7ULKcD86+wGy5HYVrgUxjSr42KZoYpKsLKGGMnSp4ZVn\nq7Sffa8NR5+qX1SD3ylhG4bjPwzpTmbGHhtHQ10e4dWofizYKaYZAufLSpeVxI7r\nCLIphptm4MTGtnbGt/BubwU=\n-----END PRIVATE KEY-----\n";
process.env.FIREBASE_PROJECT_ID = "soundfyr-dev-f1081";
process.env.MONGODB_URL = "mongodb+srv://admin:J52lPQzXVmD3rYpg@soundfyr-tb5ag.mongodb.net/soundfyr_dev?retryWrites=true";

// process.env.MONGODB_URL = "mongodb://localhost:27017/soundfyr_dev"
process.env.LINK_USER_WEB = "https://soundfyr-dev-f1081.firebaseapp.com";
process.env.NODE_ENV = "unit_test"
process.env.IS_OFFLINE = "true"
process.env.PORT_TEST = "5000";

// config live test
// process.env.firebase = JSON.stringify({
//   apiKey: "AIzaSyD6rtAhjUJE-MhKZQz9znFm7bXU6zxX_cM",
//   authDomain: "soundfyr-dev-f1081.firebaseapp.com",
//   databaseURL: "https://soundfyr-dev-f1081.firebaseio.com",
//   projectId: "soundfyr-dev-f1081",
//   storageBucket: "soundfyr-dev-f1081.appspot.com",
//   messagingSenderId: "668237328420"
// });
// process.env.host = "https://fo1i6bsk07.execute-api.ap-southeast-1.amazonaws.com/develop"


// config live production
process.env.firebase = JSON.stringify({
  apiKey: "AIzaSyAxsOp3L7kcGKdZv76m5dK5S_780m8zBwE",
  authDomain: "soundfyr-90db6.firebaseapp.com",
  databaseURL: "https://soundfyr-90db6.firebaseio.com",
  projectId: "soundfyr-90db6",
  storageBucket: "soundfyr-90db6.appspot.com",
  messagingSenderId: "412977765098"
});
process.env.host = "https://5aud1uz2gj.execute-api.ap-southeast-1.amazonaws.com/production"

const user = {
  email: "tranvannhut4495@gmail.com",
  password: "12345678"
};

// const user = {
//   email: "nhutdev@yopmail.com",
//   password: "12345678"
// };

describe("", () => {

  before("Init app", async () => {
    if (process.env.TEST_MODE === "live") {
      firebase.initializeApp(JSON.parse(process.env.firebase));
      const token = await firebase.auth().signInWithEmailAndPassword(
        user.email,
        user.password
      ).then((r) => r.user.getIdToken());
      process.env.TOKEN = token;
      console.log("Token:", token);
    }
  });

  // require("../competitions/test/index.spec");
  require("../users/test/index.spec");
  require("../feeds/test/index.spec");

});
