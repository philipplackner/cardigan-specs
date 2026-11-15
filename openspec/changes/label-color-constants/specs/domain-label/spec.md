# Spec Delta

## MODIFIED Requirements

### Requirement: Label color is a palette name
Every label SHALL have exactly one color, identified by one of these names: `AMBER`, `BLUE`, `BROWN`, `CYAN`, `EMERALD`, `FUCHSIA`, `GREEN`, `INDIGO`, `LIME`, `OLIVE`, `ORANGE`, `PINK`, `PURPLE`, `RED`, `ROSE`, `SKY`, `SLATE`, `TEAL`, `VIOLET`, `YELLOW`. Names SHALL be compared case-sensitively. Any other value SHALL be rejected. Several labels SHALL be allowed to share a color.

#### Scenario: Unknown color
- **WHEN** a label is saved with the color `#FF0000`
- **THEN** it is rejected with a validation error for the color

#### Scenario: Wrong letter case
- **WHEN** a label is saved with the color `Red` or `red`
- **THEN** it is rejected with a validation error for the color

#### Scenario: Shared color
- **WHEN** a user has a label with the color `RED` and saves another label with `RED`
- **THEN** both labels exist
