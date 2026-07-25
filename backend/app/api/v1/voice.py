from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.post("/voice", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def voice_endpoint():
    """
    Placeholder endpoint for voice analysis or translation streams.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Voice interface functionality is not implemented yet.",
    )
