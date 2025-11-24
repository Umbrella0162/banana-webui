# Task: Disable Resolution for Gemini 2.5

## Status
- [x] Update `config.ts` to include `disableResolution` flag for models <!-- id: 0 -->
- [x] Update `gemini-client.ts` to respect `disableResolution` flag and skip sending resolution parameter <!-- id: 1 -->
- [x] Update `ConfigPanel.tsx` to disable resolution selector in UI when `disableResolution` is true <!-- id: 2 -->

## Context
The user requested to disable resolution selection for Gemini 2.5 model as it shouldn't send resolution parameters. This involved changes in both backend logic (client) and frontend UI.
