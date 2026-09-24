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