import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { ApiError } from "./api";

// Sign-up and sign-in are public Cognito operations, so the application
// needs no IAM permissions for them.
const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

function clientId() {
  const id = process.env.COGNITO_CLIENT_ID;

  if (!id) {
    throw new ApiError("Sign-in is not configured", 503);
  }

  return id;
}

const messages: Record<string, [string, number]> = {
  NotAuthorizedException: ["Incorrect email or password.", 401],
  UserNotFoundException: ["Incorrect email or password.", 401],
  UserNotConfirmedException: ["Please verify your email first.", 403],
  UsernameExistsException: ["An account with this email already exists.", 409],
  CodeMismatchException: ["That verification code is incorrect.", 400],
  ExpiredCodeException: ["That code has expired. Request a new one.", 400],
  LimitExceededException: ["Too many attempts. Please try again later.", 429],
  TooManyRequestsException: ["Too many attempts. Please try again later.", 429],
  TooManyFailedAttemptsException: ["Too many attempts. Please try again later.", 429],
};

// Turns a Cognito error into a message that is safe to show the user.
function fail(error: unknown): never {
  const name = (error as { name?: string })?.name || "";
  const known = messages[name];

  if (known) {
    const apiError = new ApiError(known[0], known[1]);

    if (name === "UserNotConfirmedException") {
      apiError.code = "UNCONFIRMED";
    }

    throw apiError;
  }

  if (name === "InvalidPasswordException" || name === "InvalidParameterException") {
    throw new ApiError(
      (error as Error).message.replace(/^Password did not conform with policy: /, ""),
      400
    );
  }

  throw error;
}

export async function signIn(email: string, password: string) {
  const result = await client
    .send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId(),
        AuthParameters: { USERNAME: email, PASSWORD: password },
      })
    )
    .catch(fail);

  const token = result.AuthenticationResult?.IdToken;

  if (!token) {
    throw new ApiError("This account needs an extra sign-in step.", 400);
  }

  return token;
}

export async function signUp(name: string, email: string, password: string) {
  const result = await client
    .send(
      new SignUpCommand({
        ClientId: clientId(),
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name },
        ],
      })
    )
    .catch(fail);

  return { confirmed: Boolean(result.UserConfirmed) };
}

export async function confirmSignUp(email: string, code: string) {
  await client
    .send(
      new ConfirmSignUpCommand({
        ClientId: clientId(),
        Username: email,
        ConfirmationCode: code,
      })
    )
    .catch(fail);
}

export async function resendCode(email: string) {
  await client
    .send(
      new ResendConfirmationCodeCommand({ ClientId: clientId(), Username: email })
    )
    .catch(fail);
}
