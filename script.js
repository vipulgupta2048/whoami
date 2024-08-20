/**
 * Fetches GitHub user data and populates a table with the results.
 */
const usernamesTextarea = document.getElementById('usernames');
const fetchButton = document.getElementById('fetchButton');
const submitButton = document.getElementById('submitButton');
const selectedUsernamesField = document.getElementById('selectedUsernames');
const resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
const token = document.getElementById('auth').value

fetchButton.addEventListener('click', async () => {
    const usernames = usernamesTextarea.value.split(',').map(username => username.trim());

    resultsTable.innerHTML = ''; // Clear previous results

    let index = 0;

    const fetchNextUser = async () => {
        if (index >= usernames.length) {
            return;
        }

        const username = usernames[index];
        const newRow = resultsTable.insertRow();
        const checkboxCell = newRow.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox); // Insert checkbox into the row

        // Fetch user data
        var options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // notice the Bearer before your token
            },
        };

        Promise.all([
            fetch(`https://api.github.com/users/${username}`, options).then(response => response.json()),
            fetch(`https://api.github.com/users/${username}/repos`, options).then(response => response.json()),
            fetch(`https://api.github.com/users/${username}/orgs`, options).then(response => response.json())
        ])
            .then(async ([userData, reposData, orgsData]) => {
                const cells = [
                    userData.login,
                    userData.name,
                    userData.company,
                    userData.blog,
                    userData.bio,
                    userData.public_repos,
                    userData.followers
                ];

                // Calculate total stars and forks
                const { totalStars, totalForks } = reposData.reduce(
                    (acc, repo) => ({
                        totalStars: acc.totalStars + repo.stargazers_count,
                        totalForks: acc.totalForks + repo.forks_count
                    }),
                    { totalStars: 0, totalForks: 0 }
                );

                cells.push(totalStars, totalForks);

                // Get the list of organizations
                const organizations = orgsData.map(org => org.login);
                cells.push(organizations.join(', '));

                await new Promise(r => setTimeout(r, 2000));
                
                // Populate the table row with data
                cells.forEach(cellData => {
                    const newCell = newRow.insertCell();
                    newCell.textContent = cellData;
                });

                index++;

                setTimeout(fetchNextUser, 500); // Fetch the next user after a delay of 1 second
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Handle fetch errors (e.g., display an error message)
                const errorCell = newRow.insertCell();
                errorCell.textContent = 'Error fetching data';
                errorCell.colSpan = 10;

                index++;
                setTimeout(fetchNextUser, 500); // Fetch the next user after a delay of 1 second
            });
    };

    await fetchNextUser(); // Start fetching user data
});

submitButton.addEventListener('click', () => {
    const selectedUsernames = [];
    const checkboxes = resultsTable.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            const usernameCell = row.cells[1]; // Assuming the username is in the second cell
            selectedUsernames.push(usernameCell.textContent);
        }
    }

    selectedUsernamesField.textContent = ''; // Clear selected usernames
    selectedUsernamesField.textContent += selectedUsernames;
});