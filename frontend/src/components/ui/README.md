# UI Components (shadcn/ui)

Base UI primitives from the shadcn/ui component library.

## Purpose

Provides accessible, customizable building blocks:
- Button, Input, Textarea, Select
- Dialog, Sheet, Popover, Tooltip
- Card, Badge, Separator
- Tabs, Accordion, Collapsible
- ScrollArea, Skeleton (loading states)
- Toast / Sonner (notifications)

## Installation

Components are added individually via shadcn CLI and live in this directory.

## Rules

- **Do not add business logic** to ui/ components
- **Do not import from pages/ or services/** — ui/ is presentation only
- Customize via Tailwind classes and component variants, not by editing source
