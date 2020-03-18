// Help function to generate an IAM policy
function generatePolicy(principalId: string, effect, resource) {
  // Required output:
  const authResponse: any = {
    principalId
  };

  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [{
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,

      }]
    };

    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
}

export function generateAllow(principalId, resource) {
  return generatePolicy(principalId, "Allow", resource);
}

export function generateDeny(principalId, resource) {
  return generatePolicy(principalId, "Deny", resource);
}
