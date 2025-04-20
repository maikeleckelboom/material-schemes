import type {CustomColorGroup, DynamicScheme, TonalPalette} from '@material/material-color-utilities';
import type {
    AdaptiveColorScheme,
    Color,
    ColorScheme,
    ColorSchemeConfig,
    CssOutputConfig,
    FullColorSchemeConfig,
} from '../types';
import {createTonalPalette, formatColorToken, formatCssVarName, formatTokenName, toHex} from '../utils';
import {DEFAULT_PALETTE_TONES, MATERIAL_COLOR_ROLES} from "../constants";
import {DynamicColorScheme, MaterialTheme} from "../theme";

function reduceToObject<T, U>(items: T[], fn: (item: T) => U): U {
    return Object.assign({}, ...items.map(fn));
}

function optionToTones(paletteTones: number[] | boolean | undefined): number[] {
    if (Array.isArray(paletteTones)) return paletteTones;
    if (paletteTones) return [...DEFAULT_PALETTE_TONES];
    return [];
}

function paletteToTonalScheme(palette: TonalPalette, name: string, tones: number[]): ColorScheme {
    return valuesToTokens(name, tonesToValues(palette, tones));
}

function schemeToPalettes(scheme: DynamicScheme) {
    return {
        primary: scheme.primaryPalette,
        secondary: scheme.secondaryPalette,
        tertiary: scheme.tertiaryPalette,
        neutral: scheme.neutralPalette,
        neutralVariant: scheme.neutralVariantPalette,
    };
}

function createColorScheme<V extends boolean>(
    theme: MaterialTheme,
    options?: FullColorSchemeConfig<V>,
): AdaptiveColorScheme<V>;
function createColorScheme<V extends boolean = false>(
    dynamicScheme: DynamicScheme | DynamicColorScheme,
    options?: ColorSchemeConfig<V>,
): AdaptiveColorScheme<V>;
function createColorScheme(
    dynamicSchemeOrTheme: MaterialTheme | DynamicScheme | DynamicColorScheme,
    options?: FullColorSchemeConfig,
): ColorScheme {
    return 'schemes' in dynamicSchemeOrTheme
        ? themeToTokens(dynamicSchemeOrTheme, options)
        : schemeToTokens(dynamicSchemeOrTheme, options);
}

function themeToTokens(theme: MaterialTheme, options: FullColorSchemeConfig = {}): ColorScheme {
    const {dark = false, brightnessVariants = false, modifyColorScheme} = options;
    const baseScheme = dark ? theme.schemes.dark : theme.schemes.light;

    const colorSources: ColorScheme[] = [
        rolesToTokens(baseScheme),
        customGroupsToScheme(theme.customColors, options),
    ];

    if (options.paletteTones) {
        colorSources.push(themePalettesToSchemes(theme, optionToTones(options.paletteTones)));
    }

    if (brightnessVariants) {
        colorSources.push(
            rolesToTokens(theme.schemes.light, 'light'),
            rolesToTokens(theme.schemes.dark, 'dark'),
        );
    }

    const colorScheme = Object.assign({}, ...colorSources);
    return modifyColorScheme?.(colorScheme) ?? colorScheme;
}

function schemeToTokens(scheme: DynamicScheme, options?: ColorSchemeConfig<false>): ColorScheme {
    const dynamicSchemeColors = rolesToTokens(scheme);

    if (options?.paletteTones) {
        const targetTones = optionToTones(options.paletteTones);
        Object.entries(schemeToPalettes(scheme)).forEach(([name, palette]) => {
            Object.assign(dynamicSchemeColors, paletteToTonalScheme(palette, name, targetTones));
        });
    }

    return options?.modifyColorScheme?.(dynamicSchemeColors) ?? dynamicSchemeColors;
}

function customGroupsToScheme(
    customColorGroups: CustomColorGroup[],
    options: FullColorSchemeConfig = {},
): ColorScheme {
    return reduceToObject(customColorGroups, group =>
        groupToTokens(group, options)
    );
}


function groupToTokens(group: CustomColorGroup, options: FullColorSchemeConfig): ColorScheme {
    const colorGroup: ColorScheme = {};
    optionsToVariants(options).forEach(({type, suffix = ''}) => {
        Object.entries(group[type]).forEach(([pattern, value]) => {
            colorGroup[formatColorToken(pattern, group.color.name, suffix)] = value;
        });
    });
    return colorGroup;
}

function optionsToVariants(options: FullColorSchemeConfig): { type: 'light' | 'dark', suffix?: string }[] {
    const variants: { type: 'light' | 'dark', suffix?: string }[] = [{type: options.dark ? 'dark' : 'light'}];
    if (options.brightnessVariants) variants.push(
        {type: 'light', suffix: 'Light'},
        {type: 'dark', suffix: 'Dark'}
    );
    return variants;
}

function themePalettesToSchemes(theme: MaterialTheme, tones: number[]): ColorScheme {
    return Object.assign(
        corePalettesToSchemes(theme.palettes, tones),
        customPalettesToSchemes(theme.customColors, tones)
    );
}

function corePalettesToSchemes(palettes: Record<string, TonalPalette>, tones: number[]): ColorScheme {
    return reduceToObject(Object.entries(palettes), ([name, palette]) =>
        valuesToTokens(name, tonesToValues(palette, tones))
    );
}

function customPalettesToSchemes(groups: CustomColorGroup[], tones: number[]): ColorScheme {
    return reduceToObject(groups, group =>
        valuesToTokens(
            formatTokenName(group.color.name),
            tonesToValues(createTonalPalette(group.value), tones)
        )
    );
}

function rolesToTokens(scheme: DynamicScheme, suffix?: string): ColorScheme {
    return MATERIAL_COLOR_ROLES.reduce((acc, role) => ({
        ...acc,
        [formatTokenName(role, {suffix})]: scheme[role]
    }), {});
}

function tonesToValues(palette: TonalPalette, tones?: number[]): Record<number, number> {
    return Object.fromEntries((tones || DEFAULT_PALETTE_TONES).map(t => [t, palette.tone(t)]));
}

function valuesToTokens(name: string, colors: Record<number, Color>): ColorScheme {
    return Object.fromEntries(
        Object.entries(colors).map(([tone, color]) =>
            [formatTokenName(name, {suffix: tone}), color]
        )
    );
}

function cssVarsToString(colorScheme: ColorScheme, options?: CssOutputConfig): string {
    const {selector, minify = true} = options || {};
    let css = entriesToCssDecls(colorScheme);

    if (minify) css = css.replace(/\s+/g, ' ').trim();
    if (selector) css = wrapWithSelector(css, selector, minify);

    return css;
}

function entriesToCssDecls(colorScheme: ColorScheme): string {
    return Object.entries(colorScheme)
        .map(([varName, value]) => `${varName}: ${value};`)
        .join('\n');
}

function wrapWithSelector(css: string, selector: string, minify: boolean): string {
    return minify
        ? `${selector}{${css}}`
        : `${selector} {\n${css}\n}`;
}

function tokensToCssVarMap(colorScheme: ColorScheme) {
    return Object.fromEntries(
        Object.entries(colorScheme).map(([key, value]) => [
            formatCssVarName(key),
            typeof value === 'number' ? toHex(value) : value
        ])
    );
}

function cssVarMapToText(colorScheme: ColorScheme, options?: CssOutputConfig): string {
    return cssVarsToString(tokensToCssVarMap(colorScheme), options);
}

export {
    themeToTokens,
    schemeToTokens,
    customGroupsToScheme,
    rolesToTokens,
    valuesToTokens,
    tonesToValues,
    createColorScheme,
    tokensToCssVarMap,
    cssVarMapToText,
    cssVarsToString
};
