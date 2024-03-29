import React, { useEffect, useRef } from "react";

const mdRules = [
  { title: "From h1 to h6", rule: "# Heading -> ###### Heading" },
  { title: "Blockquote", rule: "#> Your Quote" },
  { title: "Image", rule: "![image alt](http://image_url.com)" },
  { title: "Link", rule: "#[Link Text](http://your_link.com)" },
];

export default function MarkdownHint() {
  const container = useRef();

  useEffect(() => {
    container.current?.classList.remove("-translate-y-5", "opacity-0");
    container.current?.classList.add("translate-y-0", "opacity-1");
  }, []);

  return (
    <div
      ref={container}
      className="bg-white px-2 py-4 rounded -translate-y-5 opacity-0 transition"
    >
      <h1 className="font-semibold text-center">General Markdown Rules</h1>
      <ul className="space-y-2">
        {mdRules.map(({ title, rule }) => {
          return (
            <li>
              <p className="font-semibold text-gray-500">{title}</p>
              <p className="font-semibold text-gray-700 px-2 font-serif">
                {rule}
              </p>
            </li>
          );
        })}
        <li className="text-center text-blue-700">
          <a href="https://www.markdownguide.org/basic-syntax/" target="blank">
            Find Out More
          </a>
        </li>
      </ul>
    </div>
  );
}
