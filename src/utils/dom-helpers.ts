import { CHECKBOXES, SELECT } from "../constants/element-ids";
import { HOTKEYS } from "../constants/hotkeys";
import { IGNORE_PREFIX } from "../constants/settings";
import { PlayerListContext } from "../context/player";
import { ProfileContext } from "../context/profile";
import { DataBase } from "../types/db";
import { Player } from "../types/player";

export const getRowId = (index: number): string => `player${index}_row`;
export const getNameFieldId = (index: number): string => `player${index}_name`;
export const getCheckboxId = (index: number): string => `player${index}_cb`;
export const getHotkeyId = (index: number): string => `player${index}_hk`;

export const saveToClipboard = async (playerListContext: PlayerListContext) => {
  const textToSave = playerListContext
    .playerList()
    .map(
      (player: Player) =>
        player.name &&
        (player.checked ? player.name : `${IGNORE_PREFIX}${player.name}`)
    )
    .filter(Boolean)
    .join("\n");

  await navigator.clipboard.writeText(textToSave);
};

export const toggleAllCheckboxes = (
  check: boolean,
  playerListContext: PlayerListContext
) => {
  const updatedPlayerList = playerListContext
    .playerList()
    .map((player: Player): Player => {
      const checkbox = <HTMLInputElement>(
        document.getElementById(getCheckboxId(player.rowIndex))
      );
      const textbox = <HTMLInputElement>(
        document.getElementById(getNameFieldId(player.rowIndex))
      );
      if (check) {
        checkbox.checked = textbox.value.trim() !== "";
      } else {
        checkbox.checked = false;
      }
      return { ...player, checked: checkbox.checked };
    });

  playerListContext.setPlayerList(updatedPlayerList);
};

export const toggleTableHeaderCheckbox = (playerContext: PlayerListContext) => {
  const tableHeaderCheckbox = <HTMLInputElement>(
    document.getElementById(CHECKBOXES.TOGGLE_ALL)
  );
  const shouldBeChecked = playerContext
    .playerList()
    .filter((player: Player): boolean => player.name !== "")
    .map((player: Player): boolean => player.checked)
    .reduce((isChecked: boolean, checked: boolean) => isChecked && checked);
  tableHeaderCheckbox.checked = shouldBeChecked;
};

export const fetchHotkeyById = (index: number, DB: DataBase): string =>
  DB.get(getHotkeyId(index)) || HOTKEYS[index] || "";

export const manageProfiles = (
  playerContext: PlayerListContext,
  profileContext: ProfileContext,
  selectElement: HTMLSelectElement
) => {
  let profile = selectElement.value;
  if (selectElement.value === SELECT.OPTIONS.ADD_NEW) {
    const newProfile = addNewProfile(selectElement);
    if (newProfile) {
      profile = newProfile;
      profileContext.updateProfiles({ name: profile, active: true });
    } else {
      // If user backs out of prompt to add new profile, revert to default
      profile = SELECT.OPTIONS.DEFAULT;
    }
  }
  profileContext.setActiveProfile({ name: profile, active: true });
  playerContext.updateProfile(profile);
};

export const addNewProfile = (
  selectElement: HTMLSelectElement
): string | null => {
  const newProfileName = prompt("Enter new profile name:");
  if (newProfileName) {
    const newOption = document.createElement("option");
    newOption.value = newProfileName;
    newOption.textContent = newProfileName;
    newOption.id = newProfileName;

    selectElement.insertBefore(
      newOption,
      selectElement.firstChild!.nextSibling
    );

    selectElement.value = newOption.value;
  }
  return newProfileName ?? null;
};
