/**
 * The English side of every field that was published in French only.
 *
 * Keyed by document id, then by the path to the field — `slides[2].result`
 * addresses the third slide by *position*, which is how the audit reported it
 * and how an editor reads the array in the Studio. `fill-translations.ts`
 * resolves those positions against the live document.
 *
 * ── On the multi-line fields ────────────────────────────────────────────────
 * Hero titles, shape titles and bullet lists are split across lines, and the
 * split is part of the design — line one is set in the display face, the rest
 * in the editorial one. So a translation has to land the same *number* of lines
 * and put the right words on each, which is not the same as translating each
 * line where it stands.
 *
 * French and English disagree about adjective order, so several of these
 * deliberately swap what sits on which line:
 *
 *     Coaching / personnel        →  Personal / coaching
 *     Outils / psychométriques    →  Psychometric / tools
 *     Formations / continues      →  Continuing / education
 *
 * Translating those in place would have produced "Coaching personal" and
 * "Tools psychometric". The rule is that the lines read correctly *joined*, in
 * each language, and that the count matches so the layout is unchanged.
 */
/**
 * Copy that was hardcoded in the components and had no field behind it at all.
 *
 * Moving it into Sanity means the dataset has to carry it, or the section it
 * came from renders empty — so each entry below is the exact French that was in
 * the markup, plus its English. Both locales, because there was nothing here to
 * translate *from*.
 *
 * Two of these are corrections rather than transcriptions, noted where they
 * appear: the venue band was labelled with the About label, and the contact
 * page's form was headed "Réservez le Centre I AM", which belongs to the Centre
 * I AM page and had been copied across.
 */
export const SEEDS: Record<string, Record<string, { fr: string; en: string }>> = {
    home: {
        // The field existed but had never been filled in either language — the
        // button's label was the string in the markup. Matched to
        // `entreprisesButton`, which is the same call to action further down.
        aboutButton: { fr: 'En savoir plus', en: 'Learn More' }
    },

    programs: {
        pageIntro: {
            fr: 'Des accompagnements concrets, humains et stratégiques pensés pour transformer votre vision en croissance durable. Grâce à une équipe chevronnée et un accompagnement personnalisé, nous aidons les leaders et les organisations à générer un impact réel et mobilisateur.',
            en: 'Concrete, human and strategic support designed to turn your vision into lasting growth. With a seasoned team and guidance shaped around you, we help leaders and organizations generate real, mobilizing impact.'
        }
    },

    centreIam: {
        // The band was drawing `aboutSectionLabel`, so "À Propos" appeared twice
        // on the page. Given its own label here.
        venueSectionLabel: { fr: 'Notre espace', en: 'Our space' },
        venueBody: {
            fr: 'Offrez à vos événements un espace qui inspire autant les idées que les connexions humaines. Situé au cœur du centre-ville, le Centre I AM accueille vos rencontres corporatives, ateliers et expériences collaboratives dans une atmosphère chaleureuse, lumineuse et propice aux échanges porteurs de sens.',
            en: 'Give your events a space that inspires ideas and human connection in equal measure. In the heart of downtown, the I AM Center hosts corporate meetings, workshops and collaborative experiences in a warm, light-filled atmosphere built for conversations that matter.'
        },
        bookingHeading: { fr: 'Réservez le Centre I AM', en: 'Book the I AM Center' },
        bookingMessageLabel: {
            fr: "Info supplémentaires/Description de l'événement*",
            en: 'Additional information / Event description*'
        }
    },

    contact: {
        // Was "Réservez le Centre I AM" — the Centre's heading, on the contact
        // page's own form.
        formHeading: { fr: 'Réservez une consultation', en: 'Book a consultation' }
    }
};

/**
 * Fields that *are* translated, but whose English does not break into the same
 * number of lines as its French — so the two locales render the shape title at
 * different heights, and the slide the design was drawn around only holds in
 * one language.
 *
 * Unlike everything below, these overwrite an existing value, which is why they
 * are listed separately and applied behind their own flag.
 */
export const LINE_BREAK_FIXES: Record<string, Record<string, string>> = {
    servicesEntreprises: {
        // Was "Whiteboard Workshops" on one line, against two in French.
        'slides[0].shapeTitle': 'Whiteboard\nWorkshops',
        // Was two lines against three. "Formations / et coaching / de groupe"
        // → the qualifier moves to the last line, where English wants it.
        'slides[2].shapeTitle': 'Training\nand coaching\nfor groups'
    }
};

export const TRANSLATIONS: Record<string, Record<string, string>> = {
    home: {
        // "Concrétisez votre leadership authentique". The verb stays alone on
        // line one, as in French; the adjective moves up to line two, where
        // English wants it.
        heroLine1: 'Realize',
        heroLine2: 'your authentic',
        heroLine3: 'leadership',

        'heroSlides[0].line1': 'Realize',
        'heroSlides[0].line2': 'your authentic',
        'heroSlides[0].line3': 'leadership',

        // Slides two to five are still the placeholder copy that was published
        // with them. Translated as placeholders rather than invented, so they
        // stay visibly unwritten in both languages.
        'heroSlides[1].line1': 'Lorem ipsum',
        'heroSlides[1].line2': 'dolor sit amet',
        'heroSlides[1].line3': 'title two',
        'heroSlides[2].line1': 'Lorem ipsum',
        'heroSlides[2].line2': 'dolor sit amet',
        'heroSlides[2].line3': 'title three',
        'heroSlides[3].line1': 'Lorem ipsum',
        'heroSlides[3].line2': 'dolor sit amet',
        'heroSlides[3].line3': 'title four',
        'heroSlides[4].line1': 'Lorem ipsum',
        'heroSlides[4].line2': 'dolor sit amet',
        'heroSlides[4].line3': 'title five',

        programsSectionLabel: 'Our services',

        // "Services aux entreprises" / "aux individus". The generic word keeps
        // line one, as in French, and the qualifier follows.
        entreprisesTitle1: 'Services',
        entreprisesTitle2: 'for businesses',
        leadersTitle1: 'Services',
        leadersTitle2: 'for individuals',

        // Five bullets each, one per line — the count is what the dashed list
        // renders, so it has to match exactly.
        entreprisesBody: [
            '— Whiteboard workshops',
            '— Immersive experiences',
            '— Group training / coaching',
            '— Strategic retreats',
            '— Psychometric tools'
        ].join('\n'),
        leadersBody: [
            '— Coaching - Entrepreneurs',
            '— Coaching - Managers',
            '— Coaching - Employees',
            '— Continuing education',
            '— Psychometric tools'
        ].join('\n'),

        missionQuote: 'What if the strength of your mission were a lever for strategic growth?',

        // These three already had an agreed English rendering in the committed
        // fallbacks (`homeFallbacks.ts`, `siteCopy.ts`); reused verbatim rather
        // than translated a second time, so the page reads the same whether it
        // is served from the dataset or from the fallback.
        introBold:
            'Are you looking to create meaningful and lasting change for yourself, your team, or your organization?',
        introBody:
            'At Tangible, we believe in approaches that create real impact. Our team is here to guide you, answer your questions, and build an experience tailored to your needs. Whether through consulting, programs, or personalized support, every collaboration starts with a conversation.',
        contactFooterHeading: 'Start a tangible transformation.'
    },

    about: {
        approachLine1: 'Establish trusted leadership and strengthen teams.',
        approachLine2: 'Align strategy, communication and execution.',
        approachLine3: 'Unlock collective potential and support lasting growth.',

        // Both of these were already translated in the migration source; kept
        // word for word so the two never drift apart.
        introParagraph2:
            "Our approach activates individual and collective resources to navigate the complexity of today's work world with clarity and agility.",
        visionQuote:
            'Strong leadership is built on clarity, self-awareness, and effective collaboration. It enables individuals and teams to communicate more effectively, make informed decisions, and create meaningful impact within their organization.',

        // Two lines, broken at the same place as the French.
        ronTitle: 'Founder of Tangible\nand the I AM Center'
    },

    contact: {
        heroLine4: 'in real time'
    },

    centreIam: {
        heroLine4: 'in real time',

        aboutBodyParagraph:
            'The I AM Center offers an inspiring environment where learning, reflection and guidance meet. With a team of certified professional coaches, the centre runs wellness retreats, group training, personal coaching and a range of learning paths designed to support personal leadership, self-confidence and a better balance in life.\n\nThe I AM Center’s approach is built on giving people concrete tools for greater autonomy, deeper self-knowledge and a more intentional presence across every area of life.',

        'slides[0].description':
            'Our wellness experiences are designed to offer space to step back, restore and reconnect, personally as much as professionally. Through retreats, immersive workshops and guided experiences, we create environments that invite introspection, wellbeing and the development of a more conscious, balanced presence day to day.',

        // "Formations / Coaching de groupe" — three lines, and the slash stays
        // on the first so the pairing reads the same way.
        'slides[1].title': 'Training /\nGroup\ncoaching',
        'slides[1].description':
            'Our group training and coaching services support the development of individuals and teams through collaborative, engaging experiences shaped around your reality. By combining learning, exchange and guidance, these paths strengthen communication, cohesion and collective leadership in a human and stimulating setting.',

        // French leads with the noun, English with the adjective.
        'slides[2].title': 'Personal\ncoaching',
        'slides[2].description':
            'Our coaching services offer personalized, transformative experiences, one to one or in a group. These sessions let you take stock, align with your I AM (Intention + Attention = Materialization) and reach a higher level of clarity, congruence and self-confidence, in your decisions as much as in your relationships.',

        'slides[3].title': 'Pro bono',
        'slides[3].description':
            'To widen our social impact, the I AM coaching team offers its services pro bono to non-profit organizations with a social, environmental, sporting or educational mission serving young people. A concrete way of putting our expertise at the service of those building a better world.'
    },

    servicesEntreprises: {
        'slides[0].body':
            'Our Whiteboard workshops are designed to prompt strategic thinking, clarify organizational issues and surface concrete solutions. Run in a collaborative, fast-moving format, these sessions let teams structure their ideas, align their priorities and accelerate decision-making in a setting built for collective intelligence.',
        'slides[0].result':
            'Sharper conversations, better-aligned decisions and a stronger shared vision.',

        'slides[1].body':
            'Our immersive experiences take teams and leaders out of their usual frame to encourage reflection, collaboration and engagement. Through engaging, interactive formats, we create experiences that strengthen human connection, spark innovation and support the evolution of organizational dynamics.',
        'slides[1].result':
            'More engaged teams, stronger relationships and a more coherent organizational culture.',

        'slides[2].body':
            'Our group training and coaching services give organizations concrete tools to develop leadership, improve communication and strengthen team cohesion. Through paths shaped around your business reality, we support groups in building durable practices that serve performance, engagement and collaboration.',
        'slides[2].result':
            'Better communication, smoother collaboration and higher-performing teams.',

        'slides[3].body':
            'Our strategic retreats offer a dedicated space to step back, weigh organizational priorities and strengthen alignment across the leadership team. Combining strategic guidance, collaborative workshops and structured reflection, these experiences produce a clearer vision, stronger engagement and more coherent decisions for your organization’s future.',
        'slides[3].result':
            'A more aligned leadership team, clarified priorities and a greater capacity to move the organization forward coherently.',

        // French leads with the noun, English with the adjective.
        'slides[4].shapeTitle': 'Psychometric\ntools',
        'slides[4].body':
            'Psychometric tools offer an objective, scientifically validated read on people, teams and leadership dynamics. Built into our programs or used on their own, they help people understand themselves better, improve collaboration, inform decisions and accelerate individual and collective development through concrete, actionable data.',
        'slides[4].result':
            'Better knowledge of yourself and others, more conscious leadership, stronger communication and better-informed decisions, built on objective data that serves individual and collective development.'
    },

    servicesLeaders: {
        'slides[0].shapeTitle': 'Coaching —\nEntrepreneurs',
        'slides[0].body':
            'Building a business demands vision, resilience and adaptability. Our coaching services support entrepreneurs in developing their leadership, clarifying their goals and handling the challenges that come with growth. Personalized guidance for moving forward with more confidence, more structure and clearer decision-making.',
        'slides[0].result':
            'more assured leadership, more strategic decisions and better-managed growth.',

        'slides[1].shapeTitle': 'Coaching —\nManagers',
        'slides[1].body':
            'Managing calls for a constant balance between leadership, performance and keeping teams engaged. Our programs give managers concrete tools to communicate better, strengthen their presence as leaders and navigate the day-to-day human and organizational questions more effectively.',
        'slides[1].result':
            'More engaging management, stronger communication and more committed teams.',

        'slides[2].shapeTitle': 'Coaching —\nEmployees',
        'slides[2].body':
            'Our coaching services for employees support professional development, confidence and collaboration within teams. Through human, tailored guidance, participants build concrete strategies for handling professional challenges, improving working relationships and growing with more autonomy and effectiveness.',
        'slides[2].result':
            'Employees who are more confident, more autonomous and better equipped to contribute to their working environment.',

        // French leads with the noun, English with the participle.
        'slides[3].shapeTitle': 'Continuing\neducation',
        'slides[3].body':
            'Our continuing education programs let professionals develop their skills, refresh their knowledge and strengthen their adaptability in a working world that keeps changing. Delivered in a dynamic, accessible format, they support learning that is concrete, applicable and aligned with the realities of work today.',
        'slides[3].result':
            'Stronger skills, greater professional agility and working practices that keep evolving.',

        'slides[4].shapeTitle': 'Psychometric\ntools',
        'slides[4].body':
            'Psychometric tools offer an objective, scientifically validated read on people, teams and leadership dynamics. Built into our programs or used on their own, they help people understand themselves better, improve collaboration, inform decisions and accelerate individual and collective development through concrete, actionable data.',
        'slides[4].result':
            'Better knowledge of yourself and others, more conscious leadership, stronger communication and better-informed decisions, built on objective data that serves individual and collective development.'
    }
};
