import { permanentRedirect } from "next/navigation";

// Cutover: /v2 content is now served at "/". This route issues a permanent (308)
// redirect so any existing /v2 links or ads land on the live root landing.
export default function V2Redirect() {
  permanentRedirect("/");
}
