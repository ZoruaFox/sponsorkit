import { loadConfig as _loadConfig } from 'unconfig'
import type { SponsorkitConfig, Sponsorship, Tier, TierPartition } from '../types'
import { FALLBACK_AVATAR } from './fallback'
import { presets } from './presets'
import type { SponsorkitConfig, Sponsorship, Tier } from './types'

export const defaultTiers: Tier[] = [
  {
    title: '有兽焉Minecraft粉丝服赞助项',
    preset: presets.xl,
  },
  {
    title: '有兽档案馆',
    monthlyDollars: 20,
    preset: presets.large,
  },
  {
    title: '有兽焉同人特典',
    monthlyDollars: 25,
    preset: presets.xl,
  },
  {
    title: '？？？？？',
    monthlyDollars: 40,
    preset: presets.xl,
  },
]

export const defaultInlineCSS = `
text {
  font-weight: 300;
  font-size: 14px;
  fill: #777777;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
.sponsorkit-link {
  cursor: pointer;
}
.sponsorkit-tier-title {
  font-weight: 500;
  font-size: 20px;
}
`

export const defaultConfig: SponsorkitConfig = {
  width: 800,
  outputDir: './sponsorkit',
  cacheFile: '.cache.json',
  formats: ['json', 'svg', 'png'],
  tiers: defaultTiers,
  name: 'sponsors',
  includePrivate: false,
  svgInlineCSS: defaultInlineCSS,
}

export function defineConfig(config: SponsorkitConfig): SponsorkitConfig {
  return config
}

export async function loadConfig(inlineConfig: SponsorkitConfig = {}): Promise<Required<SponsorkitConfig>> {
  const env = loadEnv()

  const { config = {} } = await _loadConfig<SponsorkitConfig>({
    sources: [
      {
        files: 'sponsor.config',
      },
      {
        files: 'sponsorkit.config',
      },
    ],
    merge: true,
  })

  const hasNegativeTier = !!config.tiers?.find(tier => tier && tier.monthlyDollars! <= 0)

  const resolved = {
    fallbackAvatar: FALLBACK_AVATAR,
    includePastSponsors: hasNegativeTier,
    ...defaultConfig,
    ...env,
    ...config,
    ...inlineConfig,
    github: {
      ...env.github,
      ...config.github,
      ...inlineConfig.github,
    },
    patreon: {
      ...env.patreon,
      ...config.patreon,
      ...inlineConfig.patreon,
    },
    opencollective: {
      ...env.opencollective,
      ...config.opencollective,
      ...inlineConfig.opencollective,
    },
    afdian: {
      ...env.afdian,
      ...config.afdian,
      ...inlineConfig.afdian,
    },
  } as Required<SponsorkitConfig>

  return resolved
}

export function partitionTiers(sponsors: Sponsorship[], tiers: Tier[], includePastSponsors?: boolean): TierPartition[] {
  const tierMappings = tiers!.map<TierPartition>(tier => ({
    monthlyDollars: tier.monthlyDollars ?? 0,
    tier,
    sponsors: [],
  }))

  tierMappings.sort((a, b) => b.monthlyDollars - a.monthlyDollars)

  const finalSponsors = tierMappings.filter(i => i.monthlyDollars === 0)

  if (finalSponsors.length !== 1)
    throw new Error(`There should be exactly one tier with no \`monthlyDollars\`, but got ${finalSponsors.length}`)

  sponsors
    .sort((a, b) => Date.parse(a.createdAt!) - Date.parse(b.createdAt!))
    .filter(s => s.monthlyDollars > 0 || includePastSponsors) // Past sponsors monthlyDollars is -1
    .forEach((sponsor) => {
      const tier = tierMappings.find(t => sponsor.monthlyDollars >= t.monthlyDollars) ?? tierMappings[0]
      tier.sponsors.push(sponsor)
    })

  return tierMappings
}
