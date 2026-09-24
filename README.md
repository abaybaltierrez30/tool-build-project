# Tool Build (mechanics)
1. What data does this tool need?
This tool needs time data (what time it is right now according to the system/internet) to signal the time the timer goes off, it needs the data of how much time the user wants to work per work segment for its break output, data from previous work sessions (to better cater daily challenges and stuff)
The data is stored in a .gitignore local storage, so that the user can get personalized data without being spyware (surveillance). This applies to any changes added/personalized by the user. The webpage is required state that all data is personalized, but it is stored locally in a .gitignore, so only the website and the user can access it, and it doesn't end up leaked in a public repository.
The data is persistent. The further you use it, the more it builds onto itself.
Yes, the system needs memory between sessions, particularly coming from the last saves/session to keep building on the data and personalizing it.
The system will require AI inference. AI may have to be the one to pull daily challenges based on user decision, preferences, or by default, and will also be the one to have to pull famous quotes and motivation (also going off developer-made motivational prompts) words from online. This all is initiated before the webpage is fully loaded. The AI is also enabled when changing to a different/new time for each break and segment.
1-2 API calls, depending on if the user is changing times or not. 1 minimum, which is the pre-loaded AI inference.
If the API fails, the system can fall back to some presets and previous preferences initiated by the user, and may have to use only some select few locally-made quotes and challenges made by the developer.
