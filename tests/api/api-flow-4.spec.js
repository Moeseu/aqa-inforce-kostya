const { test, expect } = require('@playwright/test');

test.describe('API Tests - Flow 4: Delete Room', () => {

    const baseURL = 'https://automationintesting.online';

    test('Delete Room via Admin API and verify via User API', async ({ request }) => {
        
        // --- КРОК 0: Підготовка (Логін + Створення жертви) ---
        
        // 1. Логін
        const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
            headers: { 'Content-Type': 'application/json' },
            data: { username: "admin", password: "password" }
        });
        expect(loginResponse.ok()).toBeTruthy();
        
        // Отримуємо токен
        const loginBody = await loginResponse.json();
        let authCookie = loginBody.token ? `token=${loginBody.token}` : loginResponse.headers()['set-cookie'].split(';')[0];

        // 2. Створюємо кімнату, яку не шкода видалити
        const uniqueRoomName = "Delete Me " + Date.now();
        
        const createResponse = await request.post(`${baseURL}/api/room/`, {
            headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
            data: {
                roomName: uniqueRoomName,
                type: "Single",
                accessible: true,
                description: "This room will be deleted",
                image: "https://www.mwtestconsultancy.co.uk/img/room1.jpg",
                roomPrice: "100",
                features: ["Safe"]
            }
        });
        expect(createResponse.ok()).toBeTruthy();

        // Знаходимо ID створеної кімнати
        const roomsResponse = await request.get(`${baseURL}/api/room/`);
        const roomsData = await roomsResponse.json();
        const createdRoom = roomsData.rooms.find(r => r.roomName === uniqueRoomName);
        const roomId = createdRoom.roomid;
        
        console.log(`Room created for deletion. ID: ${roomId}`);


        // --- КРОК 1: Видалення (DELETE Request) ---
        // Використовуємо метод delete()
        
        const deleteResponse = await request.delete(`${baseURL}/api/room/${roomId}`, {
            headers: { 
                'Cookie': authCookie // Токен обов'язковий!
            }
        });

        // Сервер зазвичай повертає 202 Accepted або 204 No Content при видаленні
        // Перевіримо, що статус успішний
        expect([200, 202, 204]).toContain(deleteResponse.status());
        console.log("Delete request sent. Status:", deleteResponse.status());


        // --- КРОК 2: Перевірка (USER API) ---
        // Завдання: Check that the room was deleted in the User page
        // Ми завантажуємо весь список кімнат і шукаємо нашу. Її там НЕ має бути.
        
        const verifyResponse = await request.get(`${baseURL}/api/room/`);
        const verifyData = await verifyResponse.json();
        
        const deletedRoom = verifyData.rooms.find(r => r.roomid === roomId);
        
        // Перевіряємо, що результат пошуку - undefined (нічого не знайдено)
        if (deletedRoom) {
            console.log("Test Failed! Room is still there:", deletedRoom);
        } else {
            console.log("Test Passed! Room not found in the list.");
        }

        expect(deletedRoom).toBeUndefined();
    });
});