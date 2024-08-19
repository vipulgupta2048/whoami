/**
 * Fetches GitHub user data and populates a table with the results.
 */
const usernamesTextarea = document.getElementById('usernames');
const fetchButton = document.getElementById('fetchButton');
const resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];

fetchButton.addEventListener('click', () => {
    const usernames = usernamesTextarea.value.split(',').map(username => username.trim());

    resultsTable.innerHTML = ''; // Clear previous results

    usernames.forEach((username, index) => {
        const newRow = resultsTable.insertRow();

        // Fetch user data
        Promise.all([
            fetch(`https://api.github.com/users/${username}`).then(response => response.json()),
            fetch(`https://api.github.com/users/${username}/repos`).then(response => response.json()),
            fetch(`https://api.github.com/users/${username}/orgs`).then(response => response.json())
        ])
            .then(([userData, reposData, orgsData]) => {
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

                // Populate the table row with data
                cells.forEach(cellData => {
                    const newCell = newRow.insertCell();
                    newCell.textContent = cellData;
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Handle fetch errors (e.g., display an error message)
                const errorCell = newRow.insertCell();
                errorCell.textContent = 'Error fetching data';
                errorCell.colSpan = 10;
            });
    });
});