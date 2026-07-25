from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.post("/chat", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def chat_endpoint():
    """
    Placeholder endpoint for chat interaction.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Chat functionality is not implemented yet."
    )
