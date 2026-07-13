# JSON Normalization Notes

When parsing inbox exports, support these shapes:

- top-level array of message objects
- object with messages
- object with items
- object with nested inbox collections

Field preference order:
- title: title -> subject -> headline
- brief: brief -> summary -> excerpt
- content: content -> body -> text
- id: id -> messageId -> gmailMessageId
- date: date -> receivedAt -> timestamp
