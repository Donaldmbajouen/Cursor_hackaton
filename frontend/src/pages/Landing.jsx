/**
 * Landing.jsx — Page d'accueil marketing animée
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  {
    icon: '🛡️',
    title: 'Anti-fraude robuste',
    text: 'Empreinte navigateur, hash IP et JWT par vote pour limiter les doublons.',
  },
  {
    icon: '⚡',
    title: 'Résultats en temps réel',
    text: 'Mise à jour instantanée via WebSocket — pas de rafraîchissement nécessaire.',
  },
  {
    icon: '⏱️',
    title: 'Compte à rebours intégré',
    text: 'Définissez une date de clôture, le sondage se ferme automatiquement.',
  },
  {
    icon: '🔗',
    title: 'Partage en un clic',
    text: 'Un lien public unique pour chaque sondage, prêt à diffuser.',
  },
  {
    icon: '📊',
    title: 'Dashboard créateur',
    text: 'Vos sondages, votes cumulés et statistiques agrégées au même endroit.',
  },
  {
    icon: '🌐',
    title: 'Sans inscription pour voter',
    text: 'Vos participants votent en quelques secondes, depuis n\u2019importe quel appareil.',
  },
];

const steps = [
  { n: '01', title: 'Créez votre compte', text: 'Inscription en quelques secondes avec email et mot de passe.' },
  { n: '02', title: 'Lancez votre sondage', text: 'Ajoutez votre question, vos options et une date de clôture.' },
  { n: '03', title: 'Partagez le lien', text: 'Un lien public unique à diffuser auprès de vos participants.' },
  { n: '04', title: 'Suivez les résultats', text: 'Visualisez les votes en direct dans votre dashboard.' },
];

const useCases = [
  { emoji: '🏫', title: 'Salles de classe', text: 'Quiz et votes interactifs pour les enseignants.' },
  { emoji: '🏢', title: 'Équipes & entreprises', text: 'Décisions collectives, choix de logo, dates de réunion.' },
  { emoji: '🎤', title: 'Événements & meetups', text: 'Sondages live pour engager votre audience.' },
  { emoji: '📣', title: 'Communautés en ligne', text: 'Recueillez l\u2019avis de votre communauté en un instant.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryCtaTo = isAuthenticated ? '/dashboard' : '/register';
  const primaryCtaLabel = isAuthenticated ? 'Aller au dashboard' : 'Créer un compte gratuit';
  const secondaryCtaTo = isAuthenticated ? '/create' : '/login';
  const secondaryCtaLabel = isAuthenticated ? 'Créer un sondage' : 'Se connecter';

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-glow" aria-hidden />
        <div className="container-lg landing-hero-inner">
          <motion.span
            className="badge badge-primary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            ⛓ Plateforme de vote sécurisée
          </motion.span>
          <motion.h1
            className="landing-title"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Votes sécurisés.
            <br />
            <span className="landing-title-accent">Résultats instantanés.</span>
          </motion.h1>
          <motion.p
            className="landing-subtitle"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
          >
            VoteChain vous aide à lancer des sondages publics fiables en quelques
            secondes : anti-fraude, temps réel, compte à rebours et dashboard créateur.
          </motion.p>
          <motion.div
            className="landing-cta-row"
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
          >
            <Link to={primaryCtaTo} className="btn btn-primary btn-lg">
              {primaryCtaLabel} →
            </Link>
            <Link to={secondaryCtaTo} className="btn btn-outline btn-lg">
              {secondaryCtaLabel}
            </Link>
          </motion.div>
          <motion.div
            className="landing-trust"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            <span className="badge badge-success">Anti-fraude</span>
            <span className="badge badge-primary">Temps réel</span>
            <span className="badge badge-warning">Sans compte pour voter</span>
          </motion.div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="container-lg">
          <div className="landing-section-head" data-aos="fade-up">
            <h2 className="text-2xl fw-700">Tout ce qu'il faut pour un vote fiable</h2>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Des fonctionnalités pensées pour les organisateurs comme pour les participants.
            </p>
          </div>
          <div className="landing-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card landing-feature"
                data-aos="fade-up"
                data-aos-delay={i * 60}
              >
                <div className="landing-feature-icon" aria-hidden>{f.icon}</div>
                <h3 className="text-lg fw-700">{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-alt" id="how">
        <div className="container-lg">
          <div className="landing-section-head" data-aos="fade-up">
            <h2 className="text-2xl fw-700">Comment ça marche</h2>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Quatre étapes pour passer de l'idée au résultat.
            </p>
          </div>
          <div className="landing-steps">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="landing-step"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <span className="landing-step-num">{s.n}</span>
                <h3 className="text-lg fw-700" style={{ marginTop: 12 }}>{s.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" id="usecases">
        <div className="container-lg">
          <div className="landing-section-head" data-aos="fade-up">
            <h2 className="text-2xl fw-700">Pour qui ?</h2>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
              VoteChain s'adapte à de nombreux contextes.
            </p>
          </div>
          <div className="landing-grid landing-grid-2">
            {useCases.map((u, i) => (
              <div
                key={u.title}
                className="card landing-usecase"
                data-aos="zoom-in-up"
                data-aos-delay={i * 60}
              >
                <span className="landing-usecase-emoji" aria-hidden>{u.emoji}</span>
                <div>
                  <h3 className="text-lg fw-700">{u.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    {u.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-cta">
        <div className="container-lg">
          <motion.div
            className="card landing-cta-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="text-2xl fw-700">Prêt à lancer votre premier sondage ?</h2>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>
                Créez votre compte gratuitement et lancez un vote en quelques secondes.
              </p>
            </div>
            <div className="landing-cta-actions">
              <Link to={primaryCtaTo} className="btn btn-primary btn-lg">
                {primaryCtaLabel}
              </Link>
              <Link to={secondaryCtaTo} className="btn btn-outline btn-lg">
                {secondaryCtaLabel}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
