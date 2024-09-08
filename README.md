# Bioverse Questionnaire App

This is a test app built for the Bioverse interview process. The task was to build an Intake Questionnaire System using the given csv data.

To build this I used Next Js, Typescript, and PostgreSql with Supabase for the database. This site is fully responsive and works well on both mobile and desktop.

To begin the landing page has a simple login form with username and password inputs.
All available login combinations can be revealed via the "reveal logins" button directly under the form.

Upon Logging in as a non-admin user you are directed to the questionnaire choice page. This page is dynamically generated based off of the users stored questionnaires in the database. If the user has already answered a questionnaire they are no longer allowed to choose it, and the UI reflects that. There is also a header displaying the user's username and a logout button.

After choosing a questionnaire the user is sent to the questionnaire page where they can complete the questionnaire. The form does not allow for empty inputs or whitespace. After the questionaire has been submitted the user is redirected back to the questionnaire choice page.

If logged in as an admin the user is directed to the admin panel page. The admin panel page also has a header with username and a logout button. The page displays a table of the users, each users amount of completed questionnaires, and a button to launch a modal to view the users responses in the specified format.
