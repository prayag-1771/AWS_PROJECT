import { withoutSession } from "../session";

export async function POST(request: Request) {
  return withoutSession(request);
}
