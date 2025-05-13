import { useNostrSigner } from "../../contexts";
import { Profile } from "./Profile";
import { SignIn } from "./SignIn";

export const Account = () => {
  const { isConnected } = useNostrSigner();

  if (!isConnected) {
    return <SignIn />;
  }

  return <Profile />;
};
