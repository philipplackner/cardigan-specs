# Spec Delta

## Purpose

Defines what a label is, the rules for its name and color, how label names are compared, and what happens to cards when a label is deleted.

## ADDED Requirements

### Requirement: Labels have a backend-assigned identifier
Every label SHALL have an opaque UUID assigned by the backend when the label is created. The identifier SHALL never change.

#### Scenario: New label gets an identifier
- **WHEN** a label is created
- **THEN** the backend assigns it a UUID that stays the same for the label's whole life

### Requirement: Labels are shared across a user's boards
A label SHALL belong to a user, not to a board. A user's labels SHALL be attachable to cards on any of that user's boards.

#### Scenario: Same label on two boards
- **WHEN** a user has the label `Bug` and two boards
- **THEN** `Bug` can be attached to cards on both boards

### Requirement: Label name
Every label SHALL have a required, single-line name with a length of 1 to 30, normalized and counted as defined in `text-length`.

#### Scenario: Name too long
- **WHEN** a label name has a normalized length of 31
- **THEN** it is rejected with a validation error for the name

### Requirement: Label names are unique per user ignoring case
No two labels of the same user SHALL have names that are equal after full Unicode default case folding, applied locale-independently to the normalized name. Labels of different users SHALL be allowed to share a name. The name SHALL be stored as entered after normalization, not case-folded.

#### Scenario: Different case
- **WHEN** a user has the label `Bug` and saves another label named `bug`
- **THEN** it is rejected because the name is already used

#### Scenario: Case folding beyond lowercase
- **WHEN** a user has the label `Straße` and saves another label named `STRASSE`
- **THEN** it is rejected because the name is already used

#### Scenario: Another user's label
- **WHEN** user A has the label `Bug` and user B saves a label named `Bug`
- **THEN** user B's label is accepted

### Requirement: Label color is a palette name
Every label SHALL have exactly one color, identified by one of these names: `Amber`, `Blue`, `Brown`, `Cyan`, `Emerald`, `Fuchsia`, `Green`, `Indigo`, `Lime`, `Olive`, `Orange`, `Pink`, `Purple`, `Red`, `Rose`, `Sky`, `Slate`, `Teal`, `Violet`, `Yellow`. Any other value SHALL be rejected. Several labels SHALL be allowed to share a color.

#### Scenario: Unknown color
- **WHEN** a label is saved with the color `#FF0000`
- **THEN** it is rejected with a validation error for the color

#### Scenario: Shared color
- **WHEN** a user has a label with the color `Red` and saves another label with `Red`
- **THEN** both labels exist

### Requirement: Label timestamps
Every label SHALL have a created time and an updated time, both set by the backend in UTC. The created time SHALL never change. The updated time SHALL change when the label's name or color changes.

#### Scenario: Label is recolored
- **WHEN** a label's color is changed
- **THEN** the label's updated time changes to the time of that change

### Requirement: Deleting a label removes it from cards
Deleting a label SHALL permanently delete it and remove it from every card that carries it. Deleted labels SHALL NOT be restorable. The cards themselves SHALL NOT be deleted. The updated time of every card that carried the label SHALL change to the time of the deletion.

#### Scenario: Label in use is deleted
- **WHEN** a label attached to five cards is deleted
- **THEN** the label no longer exists, the five cards still exist, none of them carries the label, and each of their updated times changes to the time of the deletion
