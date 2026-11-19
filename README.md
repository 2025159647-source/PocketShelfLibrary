# Pocket Shelf – Personal Library Manager (IMS566)

## About
Pocket Shelf is a small website to manage my own book collection. I lend my books to friends, family and colleagues, and this site helps me remember who has which book and when it must be returned.

No database is needed. All data is saved in the browser (localStorage).

## How to Log In
- Open `index.html` (or the GitHub Pages link)
- Username: `admin`
- Password: `admin123`
- Tip: click **Autofill demo account** to fill them in automatically.

## Pages
| Page | What it does |
|------|--------------|
| **Dashboard** | Shows a summary: total books, borrowers, borrowed and overdue books, 5 colourful charts, and a table showing where every book is. |
| **My Books** | List of all my books. I can add, edit, delete, search and filter them. |
| **Shelves** | A picture of my bookshelves. Each genre has its own shelf. A dashed empty slot means the book is borrowed. |
| **Borrowers** | List of people who borrow my books, and their borrowing history. |
| **Lending** | Lend a book, mark it as returned, or extend the due date by 7 days. |

## Book Status
- **Borrowed**: the book is with someone and not yet due.
- **Overdue**: the due date has passed and the book is not returned.
- **Returned**: the book is back on my shelf.

Status is automatic. It changes by itself based on the due date.

## Main Features
- Login page with error message, show/hide password and remember username
- Books are arranged by genre on shelves (Shelf A = Mystery, Shelf B = Romance, and so on)
- Click a card or chart to open the related page, already filtered
- Search, filter and sort tables, and export to CSV
- Alert when a book is overdue or due soon
- Dark and light mode
- Works on desktop and mobile

## Design
- Brand colour: `#780228`, with soft pastel colours for charts and badges
- Cute logo and picture banners
- Font: Nunito

## Tools Used
HTML, CSS, JavaScript, Bootstrap 5.3, Bootstrap Icons, Chart.js 4

## Files
- `index.html`: login page
- `app.html`: main app
- `css/style.css`: styles
- `js/app.js`: all the logic
- `images/`: logo and pictures