This is PROMPTS.md. This is where your chatbot prompts go, and this is where the result of your chatbot's changes are explained and why.
Context block:

Here are some prompt templates you can use for specific general actions that may be performed in the coding process:
Make sure to verify the change is successful by actively screenshotting and running the project, and _______.
In the canvas of the project, insert a/an _______ object inside that has the function of _______.
The (object) isn't appropriately fit into the canvas/has something missing/is missing. Try forcing _______ (feature) into the canvas again.

Every AI response must be followed by your explanation of what changed and why.

TYPED IN PROMPTS DURING THE CANVAS WORK:
Hello there! I would like to have all files in JavaScript, CSS, and HTML cleared and blanked, but not removed. Thank you!

Prompt:
"I like how the assignments panel has options for submission status, but I believe that changes must be made to it. Modify the assignments status button where it usually says "Unconfirmed" to remove "Overdue" as an option. Automatically activate "Overdue" on the assignment only when the marked due date of that specific assignment has since been passed. Replace the "Overdue" option in the submission status dropdown with "Not Submitted". If there is anything I did not specify correctly, please report it."

Explanation of Changes:
- Modified the status dropdown options to remove "Overdue" from manual user selection and replaced it with "Not Submitted".
- Implemented automatic due date verification (`isPastDue` and `getEffectiveStatus`) to automatically activate and display the "Overdue" status badge when an assignment's marked due date is in the past and the assignment is not confirmed submitted.
- Maintained "Confirmed Submitted" override so submitted assignments are not marked overdue.
- Added CSS support for `.status.not_submitted` badge and assignment completion toggling.

Prompt:
"There seems to be no data saved to a local Gitignore file that is excluded from committing and is kept private and local for the website to access. Every time the webpage reloads, all the previous data is gone. When the user loads the webpage by default, a red bar right above "WELCOME BACK, (YOUR NAME)" will be displayed with white text saying "You aren't signed in - sign in for a full experience with saved data!" On the top right corner, where the "My space" tab is, and make a sign in interface where the user can simply sign in with their username (in a bar) and password (also in a bar). On a separate tab, below the "Log in" button, put a sign up interface, where there is the same email and password layout, but it creates an account. Make sure the account can save the data, has data that the website uses for personification that is privately kept away in a .gitignore file locally, and make sure the webpage reloads into signed in data once signed in."

Explanation of Changes:
- Created `.gitignore` excluding `user_data.json` and local storage data to protect private user data from repository commits.
- Created `user_data.json` locally containing initial user personification and account data, verified to be ignored by Git.
- Implemented persistent account storage in `main.js` using `localStorage` so all assignments, timer configurations, completed challenges, and reflections persist across page reloads.
- Added a red notice bar directly above the welcome greeting with white text saying "You aren't signed in - sign in for a full experience with saved data!", visible when guest/signed out and automatically hidden when signed in.
- Built an authentication interface anchored to the top-right "My space" tab featuring:
  - Log In tab with username bar, password bar, and Log in button.
  - Sign Up tab (accessible via top tab and tab switch button below Log In) with email/username bar, display name bar for personification, password bar, and account creation button.
  - Signed-in profile view with user avatar initials, personified greeting ("Welcome back, [Name]."), and Sign Out button.
  - Automatic reloading and synchronization of saved user data upon signing in, creating an account, or refreshing the page.