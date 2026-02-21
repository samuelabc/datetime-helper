<script lang="ts">
  import { onMount } from "svelte";

  export interface SelectOption {
    value: string;
    label: string;
  }

  interface Props {
    id?: string;
    ariaLabel: string;
    value: string;
    options: SelectOption[];
    sizeClass?: "ui-select-sm" | "ui-select-md";
    heightClass?: string;
    dataDirectionId?: string | number;
    onChange: (value: string) => void;
  }

  let {
    id,
    ariaLabel,
    value,
    options,
    sizeClass = "ui-select-md",
    heightClass = "h-10",
    dataDirectionId,
    onChange,
  }: Props = $props();

  let open = $state(false);
  let activeIndex = $state(0);
  let rootElement: HTMLElement | null = null;
  let triggerElement: HTMLButtonElement | null = null;
  const generatedId = `custom-select-${Math.random().toString(36).slice(2)}`;

  const selectedLabel = $derived(options.find((option) => option.value === value)?.label ?? value);
  const listboxId = $derived(id ? `${id}-listbox` : `${generatedId}-listbox`);

  function toggleOpen(): void {
    open = !open;
    if (open) {
      const currentIndex = options.findIndex((option) => option.value === value);
      activeIndex = currentIndex >= 0 ? currentIndex : 0;
    }
  }

  function closeMenu(): void {
    open = false;
  }

  function selectAtIndex(index: number): void {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeMenu();
    triggerElement?.focus();
  }

  function moveActive(delta: number): void {
    if (!options.length) return;
    const nextIndex = (activeIndex + delta + options.length) % options.length;
    activeIndex = nextIndex;
  }

  function handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        open = true;
        const currentIndex = options.findIndex((option) => option.value === value);
        activeIndex = currentIndex >= 0 ? currentIndex : 0;
        return;
      }
      moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        open = true;
        const currentIndex = options.findIndex((option) => option.value === value);
        activeIndex = currentIndex >= 0 ? currentIndex : 0;
        return;
      }
      selectAtIndex(activeIndex);
      return;
    }
    if (event.key === "Escape") {
      if (!open) return;
      event.preventDefault();
      closeMenu();
      triggerElement?.focus();
    }
  }

  function handleNativeInput(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement;
    onChange(target.value);
  }

  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!open || !rootElement) return;
      const target = event.target as Node | null;
      if (target && !rootElement.contains(target)) {
        closeMenu();
      }
    };

    const handleWindowBlur = () => {
      closeMenu();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("blur", handleWindowBlur);
    };
  });
</script>

<div class="ui-custom-select" bind:this={rootElement}>
  <select id={id} aria-label={ariaLabel} class="ui-select-native-proxy" value={value} oninput={handleNativeInput} onchange={handleNativeInput}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  <button
    bind:this={triggerElement}
    type="button"
    class={`ui-select ${sizeClass} ${heightClass} ui-custom-select-trigger ${open ? "is-open" : ""}`}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={listboxId}
    data-direction-id={dataDirectionId}
    onclick={toggleOpen}
    onkeydown={handleTriggerKeydown}
  >
    <span class="ui-custom-select-value">{selectedLabel}</span>
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="ui-custom-select-chevron ui-select-chevron-pill">
      <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  </button>

  {#if open}
    <ul id={listboxId} role="listbox" class="ui-custom-select-list">
      {#each options as option, index}
        {@const isSelected = option.value === value}
        {@const isActive = index === activeIndex}
        <li>
          <button
            type="button"
            role="option"
            aria-selected={isSelected}
            class={`ui-custom-select-option ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`}
            onclick={() => selectAtIndex(index)}
            onmousemove={() => (activeIndex = index)}
          >
            {option.label}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
