# Final Project - Resume Reference

## Project Overview
Built a desktop invoicing and inventory analysis application using C# and Windows Forms (.NET 8). The app models customers, products, invoices, and invoice line items in memory, then uses LINQ queries to generate business reports and summaries in the UI.

## What The Application Does
- Displays customers sorted by last name or customer ID.
- Displays inventory sorted by item ID or item cost.
- Generates detailed invoice reports with line items and per-invoice totals.
- Aggregates inventory sales by item across invoices.
- Groups and summarizes invoice totals by customer.

## Technical Highlights
- **Platform:** .NET 8 Windows Forms desktop app.
- **Language:** C#.
- **Core techniques:**
	- Object-oriented domain models (`Customer`, `Inventory`, `Invoice`, `InvoiceItem`, custom `Date`).
	- LINQ joins, grouping, ordering, projection, and aggregate calculations.
	- Event-driven UI using radio button `CheckedChanged` handlers.
	- Currency formatting and structured text output in `RichTextBox` controls.
- **Data handling:** Uses strongly typed in-memory arrays as a lightweight data source.

## Notable Implementation Details
- Implemented multi-entity report queries by joining invoice, customer, inventory, and line-item data.
- Calculated invoice totals and roll-up totals (all invoices and all inventory sold) dynamically from query results.
- Added asynchronous event handlers (`async/await`) to keep the interface responsive while simulating long-running operations.
- Implemented a custom `Date` class with validation, leap-year handling, date increment logic, and operator overloading.

## Resume-Ready Summary
Developed a C#/.NET 8 Windows Forms invoicing and inventory reporting application that modeled customers, products, invoices, and line items with object-oriented design. Built LINQ-based reporting workflows (joins, grouping, sorting, and aggregations) to generate invoice detail views, inventory sales summaries, and customer-based financial rollups, with asynchronous UI event handling and custom date validation logic.
