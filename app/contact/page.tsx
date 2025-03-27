"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("Message sent!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Failed to send message. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("Failed to send message. Please try again later.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('https://source.unsplash.com/featured/?forest')" }}
    >
      <div className="bg-white bg-opacity-80 p-10 rounded-lg shadow-lg max-w-4xl w-full flex">
        {/* Contact Us Message */}
        <div className="w-1/2 pr-8">
          <h2 className="text-3xl font-bold text-black mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-6">
            We would love to hear from you! Whether you have a question, feedback,
            or just want to say hello, feel free to reach out to us using the form.
          </p>
          <p className="text-gray-700">
            You can also contact us directly at <br />
            <span className="inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884l8 4.5a1 1 0 001 0l8-4.5A1 1 0 0018.5 4H1.5a1 1 0 00-.497 1.884z" />
                <path d="M19 8.118l-8 4.5a3 3 0 01-3 0l-8-4.5V14a1 1 0 001 1h16a1 1 0 001-1V8.118z" />
              </svg>
              <a
                href="mailto:kade@firstfruitrealestate.com"
                className="text-indigo-600 hover:underline"
              >
                kade@firstfruitrealestate.com
              </a>
            </span>
            <br />
          </p>
        </div>

        {/* Contact Form */}
        <div className="w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-black">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-grass text-white py-2 px-4 rounded-md hover:opacity-80"
            >
              Submit
            </button>
            {status && <p className="mt-2 text-sm text-gray-800">{status}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
