import "./Hero.css";

export default function Hero({ onGetStarted }) {
  return (
    <main className="hero">
      <section className="left">
        <div className="brand">
          <img src="/images/logo.png" alt="ChromaTone logo" />
          <h1 className="title">ChromaTone</h1>
        </div>

        <p className="tagline">
          Discover outfit colors that flatter your unique skin tone.
          Simple, calm, and elegant styling — made for you.
        </p>

        <button className="cta" onClick={onGetStarted}>Get Started</button>
      </section>

      <section className="right">
        <img className="rack" src="/images/rack.jpg" alt="Wardrobe" />
      </section>
    </main>
  );
}
