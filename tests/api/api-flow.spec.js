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

        // [ВАЖЛИВО] Витягуємо Cookie (Token) з відповіді сервера
        const headers = loginResponse.headers();
        const setCookieHeader = headers['set-cookie'];
        
        // Перевіряємо, чи прийшов кукі
        console.log("Cookie from server:", setCookieHeader);
        expect(setCookieHeader).toBeDefined();

        // Беремо тільки частину token=... (іноді сервер додає Path, HttpOnly тощо)
        // Для цього сайту зазвичай достатньо передати весь рядок set-cookie як Cookie
        const authCookie = setCookieHeader.split(';')[0]; 

        // --- 2. Створення кімнати ---
        const roomPayload = {
            roomName: "Test Room " + Date.now(), 
            type: "Single",
            accessible: true,
            description: "API test creation",
            image: "https://www.mwtestconsultancy.co.uk/img/room1.jpg",
            roomPrice: "123", 
            features: ["WiFi", "Refreshments"]
        };

        const createResponse = await request.post(`${baseURL}/api/room/`, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie // <--- ЯВНО передаємо токен тут
            },
            data: roomPayload
        });

        // Debug: якщо знову 401 або 403, покажемо це
        if (!createResponse.ok()) {
            console.log("Create Failed Status:", createResponse.status());
            console.log("Create Failed Body:", await createResponse.text());
        }

        expect([200, 201]).toContain(createResponse.status());
        
        const createdRoom = await createResponse.json();
        const createdRoomId = createdRoom.roomid;
        console.log(`Room Created with ID: ${createdRoomId}`);

        // --- 3. Перевірка (GET) ---
        const getResponse = await request.get(`${baseURL}/api/room/`);
        const data = await getResponse.json();
        
        const foundRoom = data.rooms.find(r => r.roomid === createdRoomId);
        
        expect(foundRoom).toBeDefined();
        expect(foundRoom.roomName).toBe(roomPayload.roomName);
    });
});