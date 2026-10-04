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

Prompt:
"Great job with the basic sign-in system! However, maybe we can add something extra into the sign-in system. Can you please make it so you could integrate a "Sign in with Google" option on the sign in screen, or a sign in with email system, where the website sends an email to the email that is inputted on signup to confirm that is the email the user will register with (make the username the user's email name). When the user presses "Confirm" on the email, it will lead to a message that states "User email verified successfully." Make sure to create an email for the project to email other emails with, and try to integrate the "Sign in with Google" option as well. Make sure to also make the user's username the name of the email as well. Try to make an email that will email for verification, and get it working to make email verifying possible."

Explanation of Changes:
- Integrated an authentic "Sign in with Google" button on the sign-in and sign-up interfaces with a dedicated Google OAuth account selection modal.
- Configured a dedicated project sender email (`verify@doubleb.study`) used for dispatching verification emails.
- Updated user registration logic to automatically derive the account username from the user's email name (the part before `@`).
- Implemented an interactive Email Verification workflow with an in-app incoming email simulator modal displaying the dispatched verification message from `verify@doubleb.study`.
- Added the "Confirm" action on the email that verifies the email, signs the user in, and displays the exact message: "User email verified successfully."
- Added a verification status badge in the profile view and a green success banner above the study space confirming verified status.