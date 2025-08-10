import fs from 'fs';

interface UserRecord {
    id: number;
    name: string;
    status: string;
    createdAt: string;
}


export const createNewStatus = (data: UserRecord) => {
    const filePath = 'userStatus.json';
    let users: UserRecord[] = [];

    if (fs.existsSync(filePath)) {
        const rowData = fs.readFileSync(filePath, 'utf8');
        if (rowData) {
            users = JSON.parse(rowData);
            if (!Array.isArray(users)) {
                throw new Error('userStatus.json content is not an array');
            }
        }
    }

    const newData = {
        ...data,
        createdAt: new Date().toISOString(),
    };

    users.push(newData);

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    return newData;
};


export const fetchLatestStatus = (): UserRecord[] | null => {
    const rowData = fs.readFileSync('userStatus.json', 'utf8');
    if (!rowData) return null;

    const users: UserRecord[] = JSON.parse(rowData);


    users.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return users.slice(0, 3);
};

export const fetchUserLatestStatus = (id: number): UserRecord[] | null => {
    console.log("fetching the data")
    const rowData = fs.readFileSync('userStatus.json', 'utf8');
    if (!rowData) return null;

    const users: UserRecord[] = JSON.parse(rowData);

    const filteredUser = users.filter(user => user.id === id)
    if (filteredUser.length === 0) return null

    filteredUser.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filteredUser.slice(0, 3) ?? null;
};

