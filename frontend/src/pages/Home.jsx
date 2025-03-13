import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const features = [
    {
      title: "Faster and More Accurate Concussion Assessments",
      description:
        "Scotia Sense utilises rapid, objective saliva test combined with an app-based cognitive function assessment providing precise concussion detection.",
      image: "/images/head-injury.jpg",
    },
    {
      title: "Improved Squad Availability and Load Management",
      description:
        "We use automated data tracking and AI-driven load management insights which are tailored to each athlete.",
      image: "/images/team.jpg",
    },
    {
      title: "Less Admin and Paperwork for Coaches and Medics",
      description:
        "Our platform semi-automates injury report writing, cloud-based storage, and automatic pre-filling of fixture and player data.",
      image: "/images/test.jpg",
    },
  ];

  const steps = [
    {
      title: "Take The Test",
      description:
        "Use Scotia Sense to conduct a quick saliva and cognitive function test.",
      path: [
        "M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383z",
      ],
    },
    {
      title: "Get Instant Results",
      description:
        "The app instantly analyses your test comparing results to baseline health.",
      path: [
        "M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.646 6.24v.07H5.375v-.064c0-1.213.879-2.402 2.637-2.402 1.582 0 2.613.949 2.613 2.215 0 1.002-.6 1.667-1.287 2.43l-.096.107-1.974 2.22v.077h3.498V12H5.422v-.832l2.97-3.293c.434-.475.903-1.008.903-1.705 0-.744-.557-1.236-1.313-1.236-.843 0-1.336.615-1.336 1.306",
      ],
    },
    {
      title: "Track Recovery",
      description:
        "Monitor athlete recovery progress and get return-to-play guidance.",
      path: [
        "M7.918 8.414h-.879V7.342h.838c.78 0 1.348-.522 1.342-1.237 0-.709-.563-1.195-1.348-1.195-.79 0-1.312.498-1.348 1.055H5.275c.036-1.137.95-2.115 2.625-2.121 1.594-.012 2.608.885 2.637 2.062.023 1.137-.885 1.776-1.482 1.875v.07c.703.07 1.71.64 1.734 1.917.024 1.459-1.277 2.396-2.93 2.396-1.705 0-2.707-.967-2.754-2.144H6.33c.059.597.68 1.06 1.541 1.066.973.006 1.6-.563 1.588-1.354-.006-.779-.621-1.318-1.541-1.318",
        "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8",
      ],
    },
  ];
  return (
    <div className="container-fluid mt-5 p-0">
      <div className="container px-4 py-5">
        <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
          <div className="col-10 col-sm-8 col-lg-6">
            <img
              id="scotia-sense-image"
              src={"/images/SBT_001.png"}
              className="d-block mx-lg-auto img-fluid"
              alt="Concussion device"
              width="700"
              height="500"
              loading="lazy"
            />
          </div>
          <div className="col-lg-6">
            <h1 className="display-5 fw-bold text-body-emphasis lh-1 mb-3">
              We’re taking the headache out of concussions.
            </h1>
            <p className="lead">
              Thanks to the speed and accuracy of our concussion assessments,
              Scotia Sense makes it simpler than ever to protect athletes.
            </p>
            <Link to={"/register"}>
              <button
                type="button"
                className="btn btn-primary btn-lg px-4 me-md-2"
                id="get-started-button"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-light py-4" data-aos="fade-up">
        <div className="container">
          <h2 className="text-center mb-5 pb-2 border-bottom">
            What Scotia Sense Offers
          </h2>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`row align-items-center mb-5 ${
                index % 2 === 0 ? "" : "flex-row-reverse"
              }`}
              data-aos={index % 2 === 0 ? "fade-left" : "fade-right"}
            >
              <div className="col-md-6">
                <h3 className="text-primary">{feature.title}</h3>
                <p className="lead">{feature.description}</p>
              </div>
              <div className="col-md-6">
                <img
                  src={feature.image}
                  className="img-fluid rounded shadow"
                  alt={feature.title}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container py-4" data-aos="fade-up">
        <h2 className="text-center pb-2 border-bottom">How It Works</h2>
        <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="col d-flex align-items-start"
              data-aos="fade-up"
              data-aos-delay={index * 200}
            >
              <div className="icon-square text-body-emphasis bg-body-secondary d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  {step.path.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </svg>
              </div>
              <div>
                <h3 className="fs-2 text-body-emphasis">{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
