"""Groq AI service — LLaMA 3 explanations with dual-verification."""
from groq import Groq
from app.config import settings

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


SYSTEM_PROMPT = (
    "You are a senior space systems engineer and science communicator. "
    "Explain concepts in clear, accurate language. Base your explanations ONLY on established "
    "aerospace engineering principles and publicly documented facts. "
    "Do NOT speculate. If you reference a historical event, name it precisely. "
    "Keep responses concise (2-4 sentences unless more detail is requested)."
)

VERIFICATION_PROMPT = (
    "Review the following explanation for factual accuracy. "
    "Identify any claims that could be incorrect, overstated, or unverifiable. "
    "If the explanation is accurate, reply with only: VERIFIED. "
    "If there are issues, list them briefly."
)


def generate_explanation(topic: str, context: str = "", level: str = "general") -> dict:
    """
    Generate an AI explanation with dual-verification.
    Returns: {text, confidence, verified, issues}
    """
    if not settings.GROQ_API_KEY:
        return {"text": "AI explanations require a Groq API key.", "confidence": 0.0, "verified": False}

    client = _get_client()
    level_instruction = {
        "simple": "Explain this as if to a curious 12-year-old with no technical background.",
        "general": "Explain this in plain language for an educated general audience.",
        "technical": "Provide a technically detailed explanation suitable for an aerospace engineering student.",
    }.get(level, "Explain in plain language.")

    user_msg = f"{level_instruction}\n\nTopic: {topic}"
    if context:
        user_msg += f"\n\nAdditional context: {context}"

    try:
        # Step 1: Generate explanation
        resp1 = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.3,
            max_tokens=400,
        )
        explanation = resp1.choices[0].message.content.strip()

        # Step 2: Verify
        resp2 = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": VERIFICATION_PROMPT},
                {"role": "user", "content": explanation},
            ],
            temperature=0.1,
            max_tokens=200,
        )
        verification = resp2.choices[0].message.content.strip()
        verified = verification.upper().startswith("VERIFIED")
        confidence = 0.92 if verified else 0.70

        return {
            "text": explanation,
            "confidence": confidence,
            "verified": verified,
            "issues": None if verified else verification,
        }
    except Exception as exc:
        print(f"[Groq] Error: {exc}")
        return {"text": "AI explanation temporarily unavailable.", "confidence": 0.0, "verified": False}


def summarize_article(title: str, snippet: str) -> str:
    """Generate a 2-sentence news article summary."""
    if not settings.GROQ_API_KEY:
        return snippet[:200] if snippet else ""
    client = _get_client()
    try:
        resp = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "Summarize the following space news article in exactly 2 concise sentences."},
                {"role": "user", "content": f"Title: {title}\nContent: {snippet}"},
            ],
            temperature=0.2,
            max_tokens=120,
        )
        return resp.choices[0].message.content.strip()
    except Exception as exc:
        print(f"[Groq] Summarize error: {exc}")
        return snippet[:200] if snippet else ""


def generate_daily_digest(top_articles: list[dict]) -> str:
    """Generate a 'Today in Space' digest from top articles."""
    if not settings.GROQ_API_KEY or not top_articles:
        return ""
    client = _get_client()
    articles_text = "\n".join([f"- {a.get('title', '')}" for a in top_articles[:5]])
    try:
        resp = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are a space news anchor. Write a brief, engaging 3-sentence daily digest of today's top space news."},
                {"role": "user", "content": f"Today's top stories:\n{articles_text}"},
            ],
            temperature=0.4,
            max_tokens=200,
        )
        return resp.choices[0].message.content.strip()
    except Exception as exc:
        print(f"[Groq] Digest error: {exc}")
        return ""
