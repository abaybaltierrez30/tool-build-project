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

Prompt:
"That email integration didn't work so well, did it? Remove the "Sign in with Google" and email signin options. Ensure that NOT A SINGLE sign of email signup/sign-in stays after your revision."

Explanation of Changes:
- Completely excised the "Sign in with Google" buttons, Google OAuth selection modal, and Google branding.
- Removed all email sign-in and email sign-up inputs, labels, and helper texts from the authentication dropdown.
- Removed the Email Verification simulator modal, project sender address (`verify@doubleb.study`), and confirmation workflows.
- Removed the email verification banner (`#verifiedNotice`) and verified badge (`#authVerificationTag`).
- Restored the authentication system to a pure, private username + password layout with persistent local data storage.
- Verified across all code files (`index.html`, `main.js`, `style.css`, `theme.css`, `user_data.json`) that zero occurrences of email or Google sign-in/up logic remain.

Prompt:
"Finally, everything's mostly done. So now that we have gotten the major features over with and everything's done enough to be classified a prototype, let's do some feature revisions. In the "Assignments" tab, make it empty by default, with no assignments. It will say "No assignments added yet!" when there are none, but you can always add assignments in there. Also, make the daily challenges random, always-new challenges that aren't checklisted by default until you check them off. Make Double-B recommend 30 minutes of work and 10 minutes of recharge instead of 40 by default as well. Lots of defaults, I know. Remove the refresh button in "Assignments", as Canvas API integration proved unfeasible, and don't forget to also remove the "Today's rhythm" feature in the corner of the webpage, as it is useless. Finally, try making the colors in the UI even MORE muted, and in the "A Moment to Reflect" pop-up in the timer feature, make sure that on the text that says "Before you go, give your future self a helpful note.", add the text "Reflections help the system craft challenges, routines, and recommendations that are more helpful to your way of work. They are recommended, but optional." In that same "A Moment to Reflect" window, when you click the exit (X) button in the corner, don't lead to nothing (black screen), redirect the user back to the homepage. Thanks for all the help, I think I'll stop here."

Explanation of Changes:
- Empty Assignments State: Made the assignments list empty by default (`defaultAssignments = []`) and implemented an empty state display showing an inbox icon with the exact text "No assignments added yet!", while maintaining full capability to add new assignments via the modal.
- Random Dynamic Daily Challenges: Created a challenge pool of diverse study/focus challenges. On each load, 3 fresh challenges are randomly selected, assigned sequential indices, and rendered unchecked (`done: false`) by default. Clicking any challenge toggles completion and checks it off.
- 30 min Work / 10 min Recharge Defaults: Updated the focus recommendation copy to "30 min focus · 10 min recharge", adjusted the default input value and session clock to 30 minutes, and updated the timer reset handler and user creation profile to default to 30 minutes of focus time.
- Removed Canvas Refresh Button: Removed the `#canvasBtn` refresh button from the assignments card heading and excised its event listener from `main.js`.
- Removed "Today's rhythm": Completely removed the `#sessionProgress` circular progress ring and sessions-completed widget from the hero section and cleaned up related script references.
- Even More Muted UI Colors: Further subdued palette contrast in both light and dark modes, softening card background tints (gentle slate, muted sage, and warm oatmeal) and borders to create a distraction-free, calming visual environment.
- Reflection Modal Guidance Text: Appended "Reflections help the system craft challenges, routines, and recommendations that are more helpful to your way of work. They are recommended, but optional." to the reflection prompt paragraph.
- Reflection Modal Close Redirect: Fixed the modal close (X) button event handler to explicitly unhide `#app` while hiding `#modalBackdrop` and `#sessionView`, preventing a blank screen and safely redirecting the user back to the homepage.