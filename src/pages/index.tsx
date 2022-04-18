import { Title } from "@mantine/core";
import React from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

export default function Home() {
  let { userId, accessTokenPayload } = useSessionContext();

  console.log(userId, accessTokenPayload);
  return (
    <>
      <Title>Explorernet</Title>
    </>
  );
}
