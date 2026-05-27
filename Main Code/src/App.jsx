import { useState } from "react";
import axios from "axios";
import Header from "./components/layout/header.jsx";
import Footer from "./components/layout/footer.jsx";

import constants, {
  buildPresenceChecklist,
} from "../constants.js";

import * as pdfjslib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjslib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [presentChecklist, setPresentChecklist] = useState([]);

  const extractPDFText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjslib.getDocument({
      data: arrayBuffer,
    }).promise;

    const texts = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();

        return textContent.items
          .map((item) => item.str)
          .join(" ");
      })
    );

    return texts.join("\n").trim();
  };

  const parseJSONResponse = (reply) => {
    try {
      const parsed = JSON.parse(reply);

      if (!parsed.overallScore && !parsed.error) {
        throw new Error("Invalid AI response");
      }

      return parsed;
    } catch (err) {
      throw new Error(
        "Failed to parse AI response: " +
          err.message
      );
    }
  };

  const analyzeResume = async (text) => {
    const cleanText = text.slice(0, 5000);

    const prompt =
      constants.ANALYZE_RESUME_PROMPT.replace(
        "{{DOCUMENT_TEXT}}",
        cleanText
      );

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",
            content:
              "You are an elite ATS resume analyzer and recruiter assistant. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
        max_tokens: 3000,
        response_format: {
          type: "json_object",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${
            import.meta.env.VITE_GROQ_API_KEY
          }`,
          "Content-Type": "application/json",
        },
      }
    );

    const content =
      response.data.choices[0].message.content;

    return parseJSONResponse(content);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (
      !file ||
      file.type !== "application/pdf"
    ) {
      return alert(
        "Please upload PDF file only."
      );
    }

    setUploadedFile(file);
    setIsLoading(true);
    setAnalysis(null);
    setResumeText("");
    setPresentChecklist([]);

    try {
      const text = await extractPDFText(file);

      setResumeText(text);

      setPresentChecklist(
        buildPresenceChecklist(text)
      );

      const result = await analyzeResume(text);

      setAnalysis(result);
    } catch (err) {
      console.error(err);

      alert("Error: " + err.message);

      reset();
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setAnalysis(null);
    setResumeText("");
    setPresentChecklist([]);
  };

  const getScoreColor = (score) => {
    const value = parseInt(score);

    if (value >= 8) return "text-green-500";
    if (value >= 6) return "text-yellow-500";

    return "text-red-500";
  };

  const renderMetricCard = (
    title,
    value,
    color
  ) => (
    <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">
            {title}
          </p>

          <h3
            className={`text-4xl font-black mt-2 ${color}`}
          >
            {value}/10
          </h3>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
          📊
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-14">

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
            AI Resume

            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Analyzer
            </span>
          </h1>

          <p className="text-slate-600 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Upload your resume and receive
            professional ATS analysis,
            keyword optimization, career
            recommendations, and actionable
            AI feedback.
          </p>
        </div>

        {!uploadedFile && !isLoading && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl shadow-blue-100/50 p-10 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 mx-auto flex items-center justify-center text-5xl text-white shadow-lg mb-8">
                📄
              </div>

              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                Upload Your Resume
              </h2>

              <p className="text-slate-500 text-lg mb-8">
                PDF files only • Instant ATS
                feedback • AI Career Analysis
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold px-8 py-4 rounded-2xl cursor-pointer shadow-lg hover:scale-105"
              >
                Upload PDF Resume
              </label>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl p-12 text-center">
              <div className="w-20 h-20 border-[6px] border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-8"></div>

              <h3 className="text-3xl font-bold text-slate-800 mb-3">
                Analyzing Resume
              </h3>

              <p className="text-slate-500 text-lg">
                AI is reviewing your resume...
              </p>
            </div>
          </div>
        )}

        {analysis && uploadedFile && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-4xl text-white shadow-lg">
                    📄
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                      Analysis Complete
                    </h2>

                    <p className="text-slate-500 mt-2 break-all">
                      {uploadedFile.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 border border-blue-200 px-8 py-5 rounded-2xl text-center">
                    <p className="text-sm text-blue-600 font-medium">
                      ATS SCORE
                    </p>

                    <h3
                      className={`text-5xl font-black ${getScoreColor(
                        analysis.overallScore
                      )}`}
                    >
                      {analysis.overallScore}
                    </h3>
                  </div>

                  <button
                    onClick={reset}
                    className="bg-slate-900 hover:bg-slate-800 transition-all text-white px-6 py-4 rounded-2xl font-semibold"
                  >
                    Analyze Again
                  </button>
                </div>
              </div>
            </div>

            {analysis.performanceMetrics && (
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                {renderMetricCard(
                  "Formatting",
                  analysis.performanceMetrics
                    .formatting,
                  "text-emerald-500"
                )}

                {renderMetricCard(
                  "Content",
                  analysis.performanceMetrics
                    .contentQuality,
                  "text-blue-500"
                )}

                {renderMetricCard(
                  "ATS",
                  analysis.performanceMetrics
                    .atsCompatibility,
                  "text-violet-500"
                )}

                {renderMetricCard(
                  "Keywords",
                  analysis.performanceMetrics
                    .keywordUsage,
                  "text-purple-500"
                )}

                {renderMetricCard(
                  "Achievements",
                  analysis.performanceMetrics
                    .quantifiableAchievements,
                  "text-orange-500"
                )}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  ATS Checklist
                </h3>

                <div className="space-y-4">
                  {presentChecklist.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50"
                      >
                        <span className="font-medium text-slate-700">
                          {item.label}
                        </span>

                        <span
                          className={`font-bold ${
                            item.present
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {item.present
                            ? "Present"
                            : "Missing"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Professional Summary
                </h3>

                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-slate-700 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Strengths
                </h3>

                <div className="space-y-4">
                  {analysis.strengths?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl bg-green-50 border border-green-100"
                      >
                        <p className="text-slate-700">
                          ✅ {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Improvements
                </h3>

                <div className="space-y-4">
                  {analysis.improvements?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl bg-red-50 border border-red-100"
                      >
                        <p className="text-slate-700">
                          ⚡ {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Recommended Careers
                  </h3>

                  <span className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-semibold text-sm">
                    AI Generated
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {analysis.recommendedJobs?.length > 0 ? (
                    analysis.recommendedJobs.map(
                      (job, index) => (
                        <div
                          key={index}
                          className="p-5 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                              💼
                            </div>

                            <span className="bg-white/20 px-3 py-1 rounded-xl text-sm font-semibold">
                              {job.matchPercentage}%
                            </span>
                          </div>

                          <h4 className="text-xl font-bold">
                            {job.title}
                          </h4>

                          <p className="text-sm text-white/80 mt-2">
                            Strong match based on your resume analysis and ATS profile.
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-slate-500">
                      No AI career recommendations available.
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Keywords Detected
                </h3>

                <div className="flex flex-wrap gap-3">
                  {analysis.keywords?.map(
                    (keyword, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Action Items
                </h3>

                <div className="space-y-4">
                  {analysis.actionItems?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl bg-yellow-50 border border-yellow-100"
                      >
                        <p className="text-slate-700">
                          🚀 {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Pro Tips
                </h3>

                <div className="space-y-4">
                  {analysis.proTips?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl bg-cyan-50 border border-cyan-100"
                      >
                        <p className="text-slate-700">
                          💡 {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;