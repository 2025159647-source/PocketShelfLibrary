# Pocket Shelf – Personal Library Management System

Live Website: View Pocket Shelf
GitHub Repository: View Source Code

## 1. Introduction

Pocket Shelf is a personal library management website developed to help users organise and manage their personal book collections. The system is designed for individuals who lend books to friends, family members, and colleagues.

It provides a simple and convenient way to keep track of book collections, borrowers, borrowing records, and return dates. Users can easily identify which books are available, borrowed, or overdue.

Pocket Shelf is developed using HTML, CSS, and JavaScript, with browser `localStorage` used to store data without requiring a database.

## 2. System Objectives

The main objectives of Pocket Shelf are to:

- Organise personal book collections by genre.
- Keep track of borrowed and returned books.
- Record borrower information and borrowing history.
- Monitor book return dates and identify overdue books.
- Provide an easy-to-use interface for managing library records.

## 3. System Features

### 3.1 Login Page
- Login using a username and password.
- Autofill demo account for convenient access.
- Show and hide password functionality.
- Remember username option.
- Display error messages for invalid login details.

**Demo Account:**
- Username: `admin`
- Password: `admin123`

### 3.2 Dashboard
- Display total books and borrowers.
- Show the number of borrowed and overdue books.
- Provide five colourful charts for visualising library information.
- Display a book summary table showing book locations and statuses.
- Allow users to click dashboard cards and charts to access related pages with filters applied.

### 3.3 My Books
- View the complete book collection.
- Add new books.
- Edit existing book information.
- Delete book records.
- Search, filter, and sort book information.
- Export book records to CSV.

### 3.4 Shelves
- Display books in a visual bookshelf layout.
- Organise books according to their genres.
- Assign different genres to individual shelves.
- Use dashed empty slots to indicate books that are currently borrowed.

### 3.5 Borrowers
- View and manage borrower information.
- Display borrowing records for each person.
- Check individual borrowing history.
- Identify books currently borrowed by each person.

### 3.6 Lending
- Record new book lending transactions.
- Mark borrowed books as returned.
- Extend book return dates by seven days.
- Monitor borrowing and return information.

## 4. Book Status Management

Pocket Shelf automatically determines book statuses based on borrowing records and due dates.

| Status | Description |
|---|---|
| Available | The book is currently on the user's shelf and available to borrow. |
| Borrowed | The book is with a borrower and its due date has not passed. |
| Overdue | The book has passed its due date and has not been returned. |
| Returned | The borrowed book has been returned to the collection. |

## 5. System Design and Interface

Pocket Shelf uses a simple, friendly, and visually appealing interface to improve the user experience.

The design includes:

- **Primary Colour:** Burgundy (`#780228`).
- **Additional Colours:** Soft pastel colours for charts and status badges.
- **Typography:** Nunito font.
- **Visual Elements:** Cute logo, picture banners, and illustrated bookshelf layouts.
- **Display Modes:** Light mode and dark mode.
- **Responsive Design:** Supports desktop and mobile devices.

## 6. Technologies Used

The following technologies and tools are used to develop Pocket Shelf:

| Technology | Purpose |
|---|---|
| HTML5 | Structures the website content. |
| CSS3 | Styles the website interface and layout. |
| JavaScript | Handles system functionality and interactions. |
| Bootstrap 5.3 | Provides responsive layouts and interface components. |
| Bootstrap Icons | Provides icons for navigation and system features. |
| Chart.js 4 | Creates interactive dashboard charts. |
| localStorage | Stores system data in the browser without a database. |

## 7. System Requirements

To access Pocket Shelf, users need:

- A desktop computer, laptop, tablet, or smartphone.
- A modern web browser such as Google Chrome, Microsoft Edge, or Mozilla Firefox.
- JavaScript enabled in the browser.

No database installation or server-side programming is required for local use.

## 8. How to Run the System

**Step 1:** Download or clone the Pocket Shelf project folder.

**Step 2:** Open the project folder using Visual Studio Code.

**Step 3:** Locate and open `index.html` using a web browser. Alternatively, use the Live Server extension in Visual Studio Code.

**Step 4:** Enter the demo login credentials:

- Username: `admin`
- Password: `admin123`

**Step 5:** Click the Login button to access the Pocket Shelf dashboard.

**Tip:** Click the **Autofill demo account** option on the login page to fill in the demo credentials automatically.

## 9. Data Storage

Pocket Shelf uses the browser's `localStorage` to save information locally.

This allows users to retain their book records, borrower details, and lending transactions without connecting to an external database.

**Important Notes:**
- Data is stored in the browser used to access the system.
- Data is not automatically synchronised between different devices or browsers.
- Clearing browser storage may permanently remove saved system data.
- This project uses simulated authentication and is intended for demonstration and educational purposes.

## 10. Project Folder Structure

The project is organised into the following folder structure:

```text
Pocket-Shelf/
│
├── index.html
├── app.html
│
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
├── images/
│   ├── logo
│   └── picture banners
│
└── README.md
```

## 11. Conclusion

Pocket Shelf provides a convenient way to manage a personal book collection and monitor book lending activities. By combining book organisation, borrower management, lending records, and automatic status updates in one website, the system helps users keep their personal library organised.

The system is designed with a simple and responsive interface to provide a user-friendly experience across different devices. Overall, Pocket Shelf aims to make personal library management easier, more organised, and more enjoyable.
