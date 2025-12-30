# Listener Choice Royalty Allocation System

> An interactive demonstration exploring how music streaming platforms could empower listeners to influence royalty distribution, transforming passive consumers into active stakeholders in artist compensation.

[**Live Demo**](https://listener-choice-royalty-allocation.bolt.host) | [**Related Paper**](http://www.AgenticYears.com)

---

## Table of Contents

- [Overview](#overview)
- [The Vision](#the-vision)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Payment Models Explained](#payment-models-explained)
- [Use Cases](#use-cases)
- [Future Considerations](#future-considerations)
- [License](#license)
- [Contact](#contact)

---

## Overview

What if music fans could see — and influence — where their monthly subscription dollars go?

This project implements a working prototype of **Royalty Allocation Primitives**, a concept that gamifies music streaming payments by giving listeners agency over how their monthly subscription fees are distributed to artists. The system allows users to explore different payment models and discover how their listening behavior and preferences impact artist payouts.

**Note:** This is a concept demonstration using sample data. It does not use live songs or real streaming data.

---

## The Vision

### The Opportunity

When listeners can visualize and control their royalty allocations, they become active participants rather than passive consumers. This deeper engagement can drive:

**User Engagement & Retention**
- Increased platform loyalty and DSP retention
- Reduced churn and piracy incentives
- Authentic, sustainable user behavior
- Transparency builds trust

**Valuable Data & Insights**
- Artist discovery patterns
- Willingness-to-pay signals
- Genre and artist affinity metrics
- Engagement depth indicators

**Artist Support**
- Direct connection with engaged fans
- More transparent royalty calculations
- Potential for increased compensation from dedicated listeners
- Discovery opportunities through priority systems

### The Goal

**Transparency + Payout Choice = Better Engagement + More Valuable Data**

---

## Key Features

### Interactive Payment Model Exploration

- **User-Centric Payments** — Direct fan-to-artist relationships where your subscription fee goes only to artists you listen to
- **Pooled Model** — Traditional streaming platform allocation based on total platform plays
- **Hybrid Allocation** — Customizable blend between User-Centric and Pooled models
- **Priority Systems** — Bonus payments for favorite emerging and independent artists

### Real-Time Visualization

- Live royalty calculation adjustments as you change preferences
- Pie chart visualization of payout distribution
- Detailed payout tables showing impact across hundreds of artists
- Sample data includes millions of plays across diverse listener profiles

### Demo Listener Profiles

Pre-configured profiles showcasing different listening behaviors:
- Casual listeners
- Genre enthusiasts
- Superfans
- Discovery-focused users

Watch how each profile type impacts artist compensation differently.

---

## How It Works

1. **Select a Listener Profile** — Choose from pre-configured demo profiles representing different listening behaviors
2. **Adjust Allocation Preferences** — Use the interactive slider to blend between User-Centric and Pooled models
3. **Set Priority Bonuses** — Add extra support for emerging and independent artists
4. **Observe Impact** — Watch real-time calculations update across hundreds of artists and millions of sample plays

The interface updates instantly, showing you exactly how your choices affect the distribution of a typical monthly subscription fee across all the artists in the sample data.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/listener-choice-royalty-allocation.git
   cd listener-choice-royalty-allocation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these values from your [Supabase project settings](https://app.supabase.com).

4. **Set up the database**

   The database migrations will be applied automatically when you first connect. Then seed with sample data:
   ```bash
   npm run seed:simple
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

---

## Technical Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Data Generation:** Faker.js

### Why These Choices?

- **React + TypeScript:** Type safety and modern component architecture
- **Vite:** Lightning-fast development experience
- **Supabase:** Real-time database with built-in RLS (Row Level Security)
- **Tailwind CSS:** Rapid UI development with consistent design system

---

## Project Structure

```
listener-choice-royalty-allocation/
├── public/                          # Static assets
├── src/
│   ├── components/                  # React components
│   │   ├── AllocationSlider.tsx     # User-Centric vs Pooled slider
│   │   ├── ListenerSelector.tsx     # Listener profile selector
│   │   ├── PayoutTable.tsx          # Detailed payout breakdown
│   │   ├── PieChart.tsx             # Visual payout distribution
│   │   └── Summary.tsx              # Key metrics summary
│   ├── lib/
│   │   ├── calculator.ts            # Core royalty calculation logic
│   │   ├── royaltyCalculator.ts     # Advanced calculation helpers
│   │   ├── supabase.ts              # Database client setup
│   │   └── types.ts                 # TypeScript type definitions
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles
├── supabase/
│   └── migrations/                  # Database schema migrations
├── scripts/
│   ├── seed-database.ts             # Database seeding script
│   └── seed-simple.ts               # Simplified seeding
└── package.json
```

---

## Database Schema

The system uses a comprehensive PostgreSQL schema including:

### Core Tables

- **listeners** — User profiles with subscription tiers and preferences
- **artists** — Artist metadata including genre, popularity, and artist type (emerging/independent)
- **songs** — Track information with tempo, energy, and genre characteristics
- **plays** — Individual play events linking listeners, artists, and songs

### Performance Optimization

- **artist_play_count_cache** — Pre-aggregated play counts for faster calculations
- **platform_stats_cache** — Cached platform-wide statistics

### Security

All tables have Row Level Security (RLS) enabled with appropriate policies for read/write access.

---

## Payment Models Explained

### User-Centric Model (Fan-Powered)

Your monthly subscription fee is distributed **only** to artists you actually listened to, proportional to your listening time.

**Example:** If you listened to 100 songs this month, and 40 of them were from Artist A, then 40% of your subscription fee goes to Artist A.

**Benefits:**
- Direct fan-to-artist relationship
- Emerging artists benefit from dedicated fans
- No "Drake effect" (mega-popular artists don't dilute your payments)

### Pooled Model (Traditional)

All subscription fees are pooled together, and artists are paid based on their share of **total platform plays**.

**Example:** If Artist A had 1% of all platform plays this month, they receive 1% of the total royalty pool.

**Benefits:**
- Simple, established model
- Predictable for labels and rights holders
- Benefits artists with broad appeal

### Hybrid Model (Customizable)

Blend between User-Centric and Pooled allocation. Use the slider to set your preference:

- **0% User-Centric** → 100% Pooled (traditional streaming)
- **50% User-Centric** → 50% Pooled (balanced approach)
- **100% User-Centric** → 0% Pooled (direct fan support)

### Priority Bonuses

Add extra weight to:
- **Emerging Artists** — Artists with < 10,000 monthly listeners
- **Independent Artists** — Artists not signed to major labels

These bonuses come from your allocation, giving you a way to directly support artists you want to help grow.

---

## Use Cases

### For Streaming Platforms (Spotify, Apple Music, Amazon Music, Deezer, TIDAL, etc.)

- **Differentiation:** Stand out from competitors through user empowerment
- **Retention:** Reduce churn by making subscribers feel like active participants
- **Data:** Gather valuable preference data on artist discovery and willingness-to-pay
- **Engagement:** Gamify the streaming experience to increase platform loyalty

### For Artists & Labels

- **Transparency:** Clear visibility into how royalties are calculated
- **Fan Connection:** Direct relationship with engaged, supportive listeners
- **Discovery:** Priority systems help emerging artists get discovered
- **Fair Compensation:** Dedicated fans can ensure their favorite artists are properly compensated

### For Listeners

- **Agency:** Control over where your subscription dollars go
- **Transparency:** Understand streaming economics and artist compensation
- **Education:** Learn about the music industry payment structure
- **Impact:** Directly support artists you care about

### For Music Organizations (BMI, ASCAP, The Recording Academy, RIAA)

- **Innovation:** Lead the industry toward more equitable payment models
- **Artist Support:** Help emerging artists build sustainable careers
- **Engagement:** Turn passive listeners into active stakeholders
- **Education:** Promote understanding of music economics

---

## Future Considerations

### Implementation Challenges

This is a **concept demonstration**. Real-world implementation would require:

1. **Industry Coordination**
   - Label agreement on alternative payment models
   - DSP license adaptations
   - Rights holder buy-in
   - Regulatory compliance

2. **Technical Infrastructure**
   - Real-time calculation at scale
   - Integration with existing royalty systems
   - Audit and reporting capabilities
   - Performance optimization for millions of users

3. **User Experience**
   - Mobile app development
   - Onboarding and education
   - Default settings for casual users
   - Privacy considerations

### Potential Enhancements

- Integration with actual streaming platform APIs
- Social features (shared allocation strategies, leaderboards)
- Advanced analytics dashboards for artists
- A/B testing frameworks for model optimization
- Machine learning for personalized allocation suggestions
- Export reports and tax documentation

---

## License

MIT License - see [LICENSE](LICENSE) for details

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for discussion.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Contact

**Author:** Thomas Sachson

**Project Link:** [https://github.com/tsachson/listener-choice-royalty-allocation](https://github.com/tsachson/listener-choice-royalty-allocation)

**Related Paper:** [www.AgenticYears.com](http://www.AgenticYears.com)

For questions, feedback, or collaboration opportunities, please open an issue or reach out via the contact information on the related paper.

---

## Acknowledgments

This project was inspired by ongoing discussions in the music industry about:
- Fair artist compensation
- Streaming economics
- Artist sustainability
- Fan engagement and retention
- The future of digital music distribution

Special recognition to the artists, labels, streaming platforms, and music organizations working to create a more equitable and sustainable music ecosystem.

---

## Relevant Stakeholders

**Streaming Platforms:** Spotify, Apple Music, Amazon Music, Deezer, SoundCloud, TIDAL, Napster

**Music Organizations:** BMI, ASCAP, The Recording Academy, RIAA

**Music Media:** Music Business Worldwide, Rolling Stone, Billboard

---

**Built with passion for music and technology. Let's reimagine how streaming can support artists and engage fans.**
