# ZERO

**Dial 0. Just ask.**

An AI hotel operator prototype by Fred Wong Studio.

ZERO is a prototype exploring how an AI hotel operator can answer guest calls, understand requests, provide information and coordinate simple service requests.

## Run locally

This is an independent Next.js / React / TypeScript / Tailwind application inside `ZERO`. Node 22 or newer is recommended; implementation was developed with Node 24. Chrome is used for the included browser checks.

```sh
cd /Users/frederickwong/Desktop/ZERO
npm ci
cp .env.example .env.local
npm run dev
```

Open http://127.0.0.1:3100. Without credentials the interface displays a clear setup message. It does not simulate a successful live connection.

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `ELEVENLABS_API_KEY` | Yes for authenticated calls | Server-only ElevenLabs credential. Keep it in `.env.local`; never use a `NEXT_PUBLIC_` prefix or commit it. |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Yes | Agent identifier from ElevenLabs. This is not a secret. |
| `ZERO_PUBLIC_AGENT` | No; default `false` | `true` permits an unauthenticated/public agent during local development only. No API key is needed in this mode. Ignored in production. |
| `ZERO_ENABLE_PREVIEW` | No; default `false` | `true` enables the development-only scripted preview at `/?preview=1`. Ignored in production. |

Restart the development server after changing environment variables. Production requires both the API key and agent ID. Use HTTPS when hosting; localhost/127.0.0.1 also supports microphone access. This application needs a Next.js server, not a static export.

## Exact ElevenLabs agent setup

1. In ElevenLabs, open **Agents** and create a blank conversational voice agent named **ZERO — Guest Services**. Choose English and a calm, natural voice. Select an available conversational model with client-tool support. Use a voice conversation, not text-only mode.
2. Set **First message** to: `Good evening, Guest Services. How may I assist you?`
3. Paste the entire contents of `elevenlabs/agent-prompt.md` into the agent's system prompt. It contains the room, Wi-Fi details, supported services, quantity clarification, and confirmation rules. No additional knowledge base is needed.
4. Under **Tools**, add a **Client tool**, named exactly `createServiceRequest` (case-sensitive). Use the description and parameter schema in `elevenlabs/createServiceRequest.json`. If the dashboard offers JSON editing, use that file as the tool definition. Otherwise enter these five required fields:

   | Name | Type | Allowed value / meaning |
   |---|---|---|
   | `room` | String | `110` |
   | `requestType` | String | `amenity_request` |
   | `item` | String | `extra_towels` or `bottled_water` |
   | `quantity` | Number | Positive whole number supplied by the guest |
   | `department` | String | `Housekeeping` |

5. Enable **Wait for response / Expects response** (`expects_response: true`), so the agent waits for the browser tool result before confirming. Use a 10-second tool response timeout. This is a client tool: do not supply a webhook URL or a real dispatch integration. Attach the tool to this agent if created in the workspace tool library.
6. Optionally enable the built-in **End call** (`end_call`) tool so the operator can close the conversation after a goodbye. The app's End call button works independently.
7. In **Advanced → Client events**, enable `user_transcript`, `agent_response`, and `client_tool_call`, and retain the normal voice events, including `audio` and `interruption`. Transcript events are required for the optional transcript and Wi-Fi summary. Client tools must be enabled for service requests. The app uses SDK mode events for speaking/listening.
8. Enable agent authentication in the agent's **Security / Authentication** settings. The app obtains a temporary WebRTC token server-side. Disable client prompt overrides unless you intentionally need them; ZERO does not require overrides. The room is fixed in the prompt and independently validated in the client tool.
9. Save/publish the agent configuration as required by the dashboard. Copy the agent ID into `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`. Create an ElevenLabs API key with permission to access that agent and obtain conversation tokens, and put it in `ELEVENLABS_API_KEY` in `.env.local`.
10. Restart ZERO. Press 0, allow microphone access, and run the live acceptance checks below. Tool configuration inside ElevenLabs cannot be validated by local TypeScript compilation.

Dashboard labels can vary. The exact tool name, schema, `expects_response`, and client event names above are the integration contract.

For an initial public-agent test, turn off authentication on that development agent, set its ID, and set `ZERO_PUBLIC_AGENT=true`. Do not use this shortcut for the preferred authenticated final configuration.

## Voice and data flow

Pressing 0 requests microphone permission. The permission-check stream is immediately stopped; ElevenLabs then owns the active call audio. Authenticated calls POST to `/api/elevenlabs-token`, which fetches `GET https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=…` using the server API key. The browser receives only `conversationToken` and starts an explicit WebRTC session through `ConversationProvider` and the React SDK.

The token route rejects cross-origin browser requests, uses a fixed configured agent, never caches token responses, times out upstream requests, and does not expose provider diagnostics. This is a public portfolio experience, not an authenticated guest portal; the route does not implement user accounts or per-user quotas.

`createServiceRequest` validates every parameter, returns a simulated `created` result, and stores the latest request in React state. It makes no dispatch network request. If the guest asks for both amenities, the summary explicitly shows the **latest** service request; the transcript can show the rest of the conversation. Wi-Fi is marked resolved only when an agent message contains the known network or password. A question alone cannot resolve an intent. This is based on received response text, not a guarantee the guest heard every audio word before hanging up.

State is per call and held only in memory. Starting a new call clears the previous summary/transcript. There is no database, local storage, login, analytics, or real housekeeping integration. Voice audio is sent to ElevenLabs during a live call; any provider-side retention is governed by the agent/account settings and should be reviewed there.

## Scripted visual preview

With `ZERO_ENABLE_PREVIEW=true`, visit `/?preview=1`. The banner identifies it as scripted and no microphone or ElevenLabs connection is used. Press 0, wait at least four seconds after connection, then end the call to see a sample towel request. Ending earlier records no completed request.

Development fixtures `/?preview=1&scenario=water` and `/?preview=1&scenario=wifi` exercise the other summary layouts. These are visual fixtures, not voice recognition or evidence of a live integration. They are disabled in production.

## Verification

```sh
npm test
npm run typecheck
npm run test:ui
npm run build
```

The browser suite starts an isolated development server on port 3101 with deliberately fake credentials. It checks 375, 430, 768, 1024, and 1440px layouts, keyboard activation, touch targets, mute controls, scripted summaries, reset, microphone denial, token failure, cancellation while permission is pending, and timeout. It never makes a real ElevenLabs call. Browser tests use installed Google Chrome (`channel: "chrome"`); adjust the Playwright config or install Chrome on another machine.

The unit suite checks validated amenity requests, rejection of missing/invalid quantities and unsupported destinations, conservative Wi-Fi resolution, and the server authorization route with a mocked upstream.

Verified during implementation: production build and TypeScript passed; all 5 unit checks and all 12 browser checks passed (three error-state checks passed on rerun after correcting test selectors). Desktop, mobile, and active-call screenshots were visually reviewed. No live ElevenLabs session was tested.

### Manual live acceptance checks — still required

- Ask “Can I get some towels?” Confirm that the operator asks for quantity, then say “Two.” Verify the tool succeeds and the summary shows Room 110, Extra towels, 2, Housekeeping, Request created.
- Ask for bottled water without a quantity, supply a quantity, and verify the resulting water request.
- Ask for the Wi-Fi password. Confirm that the operator says Room Eleven / welcometozero and that the post-call summary shows Wi-Fi information resolved.
- Check interruption, actual microphone mute/unmute, audible operator speech, natural end-of-call, and microphone release on the real device.
- Try an immediate hang-up, network failure, and a second call. Confirm no old request appears in the new call.

No live agent credentials were supplied during implementation. Real token issuance, audible voice, recognition, model clarification, remote tool invocation, and provider-side settings must still be verified with a configured ElevenLabs agent. There is no deployed URL yet.

### SDK notes

The installed SDK is pinned in the lockfile. In `@elevenlabs/react` 1.15.2, the React `startSession` control returns `void`; actual connection success is reported through `onConnect`, and failures through callbacks. ZERO does not treat a button press or a returned function call as a connected session.

ElevenLabs documents a temporary `livekit-client: 2.16.1` override for environments that fail with `/rtc/v1` 404s or `v1 RTC path not found`. No such real-session failure has been observed here, so the workaround has not been applied. If that specific error occurs during the live acceptance test, follow the official guidance below and retest.

## Files

All implementation changes are contained in `ZERO/`:

- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`: page composition, ZERO identity, metadata, responsive styling.
- `app/api/elevenlabs-token/route.ts`: authenticated WebRTC token proxy.
- `components/Operator.tsx`: live session lifecycle, tools, timer, transcript, errors.
- `components/HotelPhone.tsx`, `DialPad.tsx`, `CallControls.tsx`, `StatusIndicator.tsx`, `Icons.tsx`: accessible phone interaction.
- `components/Experience.tsx`, `InstructionPanel.tsx`, `CallSummary.tsx`: page and post-call presentation.
- `components/MockOperator.tsx`: development-only scripted fixture.
- `lib/hotelConfig.ts`, `types.ts`, `serviceRequests.ts`: known hotel context, types, validation.
- `elevenlabs/agent-prompt.md`, `createServiceRequest.json`: exact manual agent configuration.
- `tests/`, `playwright.config.ts`: unit and browser verification.
- `public/icon.svg`: ZERO favicon.
- `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`: project setup.
- `AGENTS.md`, `CLAUDE.md`: guidance files generated by Next.js. `.env.local` is an ignored local template with blank credentials and scripted preview enabled.

## Official references checked during implementation

- [ElevenLabs React SDK](https://elevenlabs.io/docs/eleven-agents/libraries/react)
- [WebRTC conversation token endpoint](https://elevenlabs.io/docs/api-reference/conversations/get-webrtc-token)
- [ElevenLabs JavaScript SDK and client events](https://elevenlabs.io/docs/eleven-agents/libraries/java-script)
- [ElevenLabs client-tool reference](https://github.com/elevenlabs/skills/blob/main/agents/references/client-tools.md)
- [Official ElevenLabs WebRTC compatibility guidance](https://github.com/elevenlabs/plugin/blob/main/skills/general/agents/SKILL.md#temporary-livekit-websocket-pin)
