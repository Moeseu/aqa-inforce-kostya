const { test, expect } = require('@playwright/test');

test.describe('API Tests - Flow 2: Booking', () => {

    const baseURL = 'https://automationintesting.online';

    // Допоміжна функція для отримання дат (Сьогодні і Завтра)
    // Це потрібно, щоб дати у тесті завжди були актуальними
    function getBookingDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return {
            checkin: today.toISOString().split('T')[0], // Формат YYYY-MM-DD
            checkout: tomorrow.toISOString().split('T')[0]
        };
    }

    test('Book room via User API and verify via Admin API', async ({ request }) => {
        
        // --- КРОК 0: Підготовка (Логін + Створення кімнати) ---
        // Нам потрібна кімната, яку ми будемо бронювати. Створимо нову.
        
        // 1. Логін
        const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
            headers: { 'Content-Type': 'application/json' },
            data: { username: "admin", password: "password" }
        });
        expect(loginResponse.ok()).toBeTruthy();
        
        // Отримуємо токен (з тіла або кукі)
        const loginBody = await loginResponse.json();
        let authCookie = loginBody.token ? `token=${loginBody.token}` : loginResponse.headers()['set-cookie'].split(';')[0];

        // 2. Створюємо кімнату для тесту
        const uniqueRoomName = "Booking Test " + Date.now();
        const createResponse = await request.post(`${baseURL}/api/room/`, {
            headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
            data: {
                roomName: uniqueRoomName,
                type: "Double",
                accessible: true,
                description: "Room for booking test",
                image: "https://www.mwtestconsultancy.co.uk/img/room1.jpg",
                roomPrice: "200",
                features: ["WiFi"]
            }
        });
        expect(createResponse.ok()).toBeTruthy();
        
        // Знаходимо ID створеної кімнати (через GET, як в минулому тесті)
        const roomsResponse = await request.get(`${baseURL}/api/room/`);
        const roomsData = await roomsResponse.json();
        const createdRoom = roomsData.rooms.find(r => r.roomName === uniqueRoomName);
        const roomId = createdRoom.roomid;
        
        console.log(`Prepared Room ID for booking: ${roomId}`);


        // --- КРОК 1: Бронювання (USER API) ---
        // Використовуємо дані з вашого логу, але підставляємо наш roomId і свіжі дати
        const dates = getBookingDates();
        
        const bookingPayload = {
            roomid: roomId, // ВАЖЛИВО: ID нашої нової кімнати
            firstname: "KUZMENKO",
            lastname: "KOSTIANTYN",
            depositpaid: false,
            bookingdates: {
                checkin: dates.checkin,
                checkout: dates.checkout
            },
            email: "fake@fakeemail.com",
            phone: "123412341234"
        };

        const bookingResponse = await request.post(`${baseURL}/api/booking/`, {
            headers: { 'Content-Type': 'application/json' },
            data: bookingPayload
        });

        // Ви отримали статус 201 Created - перевіряємо це
        expect(bookingResponse.status()).toBe(201);
        console.log("Booking successful!");


        // --- КРОК 2: Перевірка в Адмінці (ADMIN API) ---
        // Завдання: "Check that the room is booked on the Admin page"
        
        // Варіант А: Перевірка через endpoint бронювань (найнадійніший)
        // Ми запитуємо всі бронювання для цієї конкретної кімнати
        const verifyBookingResponse = await request.get(`${baseURL}/api/booking/?roomid=${roomId}`, {
            headers: { 'Cookie': authCookie } // Потрібні права адміна, щоб бачити деталі
        });
        expect(verifyBookingResponse.ok()).toBeTruthy();

        const bookings = await verifyBookingResponse.json();
        console.log("Bookings found for this room:", bookings);

        // Перевіряємо, що список бронювань не порожній
        expect(bookings.bookings.length).toBeGreaterThan(0);
        
        // Перевіряємо, що дати співпадають
        const myBooking = bookings.bookings[0];
        expect(myBooking.bookingdates.checkin).toBe(dates.checkin);
        expect(myBooking.bookingdates.checkout).toBe(dates.checkout);
        expect(myBooking.roomid).toBe(roomId);
        
        console.log("Test Passed: Room is explicitly booked in Admin system.");
    });
});