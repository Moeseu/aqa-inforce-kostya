const { test, expect } = require('@playwright/test');

test.describe('API Tests - Inforce Task', () => {

    const baseURL = 'https://automationintesting.online';

    test('Create Room via Admin API and verify via User API', async ({ request }) => {
        
        // --- 1. Логін ---
        const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
            headers: { 'Content-Type': 'application/json' },
            data: { username: "admin", password: "password" }
        });
        expect(loginResponse.ok()).toBeTruthy();

        // Отримуємо токен (з тіла або з куків)
        const loginBody = await loginResponse.json();
        let authCookie;
        if (loginBody.token) {
            authCookie = `token=${loginBody.token}`;
        } else {
            const setCookie = loginResponse.headers()['set-cookie'];
            if (setCookie) authCookie = setCookie.split(';')[0];
        }
        console.log("Auth Cookie:", authCookie);

        // --- 2. Створення кімнати ---
        // Генеруємо унікальне ім'я, щоб точно знайти цю кімнату потім
        const uniqueRoomName = "Kostya Room " + Date.now();

        const roomPayload = {
            roomName: uniqueRoomName, 
            type: "Single",
            accessible: true,
            description: "Test room for API automation",
            image: "https://www.mwtestconsultancy.co.uk/img/room1.jpg",
            roomPrice: "555", 
            features: ["WiFi", "Safe"]
        };

        const createResponse = await request.post(`${baseURL}/api/room/`, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            data: roomPayload
        });
        expect([200, 201]).toContain(createResponse.status());
        console.log("Room create status:", createResponse.status());

        // --- 3. Перевірка і Пошук ID (GET) ---
        const getResponse = await request.get(`${baseURL}/api/room/`);
        expect(getResponse.ok()).toBeTruthy();
        
        const data = await getResponse.json();
        
        // Шукаємо кімнату за нашим УНІКАЛЬНИМ ім'ям
        const foundRoom = data.rooms.find(r => r.roomName === uniqueRoomName);
        
        expect(foundRoom).toBeDefined();
        
        // ТЕПЕР МИ МАЄМО ID!
        const roomId = foundRoom.roomid;
        console.log(`SUCCESS! Found Room ID: ${roomId}`);
        
        // Перевіряємо дані
        expect(foundRoom.type).toBe(roomPayload.type);
        expect(foundRoom.roomPrice).toBe(parseInt(roomPayload.roomPrice));
    });
});