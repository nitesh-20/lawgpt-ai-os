from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.post("/draft", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def draft_endpoint():
    """
    Placeholder endpoint for legal document drafting requests.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document drafting functionality is not implemented yet.",
    )
