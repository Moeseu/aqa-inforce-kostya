const { test, expect } = require('@playwright/test');

test.describe('API Tests - Flow 3: Edit Room', () => {

    const baseURL = 'https://automationintesting.online';

    test('Edit Room via Admin API and verify via User API', async ({ request }) => {
        
        // --- КРОК 0: Підготовка (Логін + Створення кімнати) ---
        
        // 1. Логін
        const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
            headers: { 'Content-Type': 'application/json' },
            data: { username: "admin", password: "password" }
        });
        expect(loginResponse.ok()).toBeTruthy();
        
        // Отримуємо токен
        const loginBody = await loginResponse.json();
        let authCookie = loginBody.token ? `token=${loginBody.token}` : loginResponse.headers()['set-cookie'].split(';')[0];

        // 2. Створюємо кімнату, яку будемо редагувати
        const uniqueRoomName = "Edit Test " + Date.now();
        const initialPrice = "150";
        
        // Дані для створення
        const initialPayload = {
            roomName: uniqueRoomName,
            type: "Twin",
            accessible: false,
            description: "Room before editing",
            image: "https://www.mwtestconsultancy.co.uk/img/room1.jpg",
            roomPrice: initialPrice,
            features: ["WiFi"]
        };

        const createResponse = await request.post(`${baseURL}/api/room/`, {
            headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
            data: initialPayload
        });
        expect(createResponse.ok()).toBeTruthy();

        // 3. Отримуємо ID створеної кімнати
        const roomsResponse = await request.get(`${baseURL}/api/room/`);
        const roomsData = await roomsResponse.json();
        const createdRoom = roomsData.rooms.find(r => r.roomName === uniqueRoomName);
        const roomId = createdRoom.roomid;
        
        console.log(`Room created with ID: ${roomId} and Price: ${initialPrice}`);


        // --- КРОК 1: Редагування (PUT Request) ---
        
        // Підготуємо нові дані.
        // ВАЖЛИВО: PUT запит вимагає відправити ПОВНИЙ об'єкт, а не тільки те, що змінилося.
        // Ми беремо старі дані і змінюємо тільки Ціну та Опис.
        
        const newPrice = "999";
        const newDescription = "Room AFTER editing via API";

        const updatePayload = {
            roomid: roomId, // Сервер часто вимагає ID всередині тіла також
            roomName: uniqueRoomName, // Ім'я залишаємо те саме
            type: "Twin",
            accessible: false,
            description: newDescription, // <--- ЗМІНА 1
            image: "https://www.mwtestconsultancy.co.uk/img/room1.jpg",
            roomPrice: newPrice,         // <--- ЗМІНА 2
            features: ["WiFi", "TV"]     // Додали TV
        };

        const updateResponse = await request.put(`${baseURL}/api/room/${roomId}`, {
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': authCookie // Обов'язково потрібен токен
            },
            data: updatePayload
        });

        expect(updateResponse.ok()).toBeTruthy();
        console.log(`Room updated. Status: ${updateResponse.status()}`);


        // --- КРОК 2: Перевірка змін (USER API) ---
        // Робимо публічний GET запит, щоб перевірити, чи бачить користувач нову ціну
        
        const verifyResponse = await request.get(`${baseURL}/api/room/${roomId}`);
        const updatedRoomData = await verifyResponse.json();

        console.log("Updated Data from Server:", updatedRoomData);

        // Перевірки
        expect(updatedRoomData.description).toBe(newDescription);
        
        // Увага: сервер може повертати ціну як число, хоча ми відправляли рядок
        // Тому використовуємо toString() або порівнюємо числа
        expect(updatedRoomData.roomPrice.toString()).toBe(newPrice);
        
        console.log("Test Passed: Room price updated successfully.");
    });
});