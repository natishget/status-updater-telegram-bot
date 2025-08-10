import fs from 'fs';

interface UserRecord {
    id: number;
    name: string;
    status: string;
    createdAt: string;
}

export const createNewStatus = (data: UserRecord) => {
    const userStatus = JSON.stringify(data, null, 2);
    return fs.writeFileSync("userStatus.json", userStatus, 'utf8')
}

export const fetchLatestStatus = (): UserRecord[] | null => {
    const rowData = fs.readFileSync('userStatus.json', 'utf8');
    if (!rowData) return null
    const users: UserRecord[] = JSON.parse(rowData);

    users.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latestStatus = users.slice(0, 3);

    return latestStatus ?? null;
};

export const fetchUserLatestStatus = (id: number): UserRecord[] | null => {
    const rowData = fs.readFileSync('userStatus.json', 'utf8');
    if (rowData) return null;
    let users: UserRecord[] = [];

    try {
        users = JSON.parse(rowData);
    } catch (e) {
        return null;
    }
    const filteredUser = users.filter(user => user.id == id)
    if (filteredUser.length === 0) return null

    filteredUser.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filteredUser.slice(0, 3) ?? null;
};

